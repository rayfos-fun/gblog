export type UnitId = string;
export type Side = 'PLAYER' | 'ENEMY';

export interface Unit {
    id: UnitId;
    name: string;
    hp: number;
    maxHp: number;
    atk: number;
    speed: number;
    side: Side;
    pos: number; // 0-8 index in their respective 3x3 grid
    nextActionTick: number;
}

export interface LogEntry {
    tick: number;
    message: string;
}

export class ThreeHeroesEngine {
    public units: Unit[] = [];
    public tick: number = 0;
    public logs: LogEntry[] = [];
    public isRunning: boolean = false;
    private intervalId: any = null;
    private onUpdate: () => void;

    constructor(onUpdate: () => void) {
        this.onUpdate = onUpdate;
        this.reset();
    }

    public reset() {
        this.tick = 0;
        this.logs = [];
        this.isRunning = false;
        if (this.intervalId) clearInterval(this.intervalId);

        this.units = [
            // Enemy: Lu Bu (E5 -> Index 4)
            {
                id: 'lubu', name: '呂布', hp: 300, maxHp: 300, atk: 50, speed: 6,
                side: 'ENEMY', pos: 4, nextActionTick: 6
            },
            // Player: Liu Bei (P4 -> Index 3)
            {
                id: 'liubei', name: '劉備', hp: 100, maxHp: 100, atk: 10, speed: 10,
                side: 'PLAYER', pos: 3, nextActionTick: 10
            },
            // Player: Guan Yu (P5 -> Index 4)
            {
                id: 'guanyu', name: '關羽', hp: 180, maxHp: 180, atk: 30, speed: 8,
                side: 'PLAYER', pos: 4, nextActionTick: 8
            },
            // Player: Zhang Fei (P6 -> Index 5)
            {
                id: 'zhangfei', name: '張飛', hp: 180, maxHp: 180, atk: 30, speed: 8,
                side: 'PLAYER', pos: 5, nextActionTick: 8
            }
        ];
        this.addLog(0, "戰鬥準備就緒。");
        this.onUpdate();
    }

    public startBattle() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.processTick();
            this.onUpdate();
        }, 800); // 800ms per tick for visibility
    }

    public stopBattle() {
        this.isRunning = false;
        if (this.intervalId) clearInterval(this.intervalId);
        this.onUpdate();
    }

    public processTick() {
        this.tick++;

        // Check for actions allowed at this tick
        // Sort units so we process them in consistent order if they act on same tick?
        // Requirement says "Check if any unit's NextActionTick == CurrentTick"
        // If multiple units act on same tick, usually speed determines sub-order, but here speed IS the interval.
        // Let's settle purely by current list order or Side priority? 
        // For deterministic prototype, let's just iterate.

        const actingUnits = this.units.filter(u => u.nextActionTick === this.tick && u.hp > 0);

        if (actingUnits.length === 0) {
            // No actions this tick
            return;
        }

        actingUnits.forEach(unit => {
            this.executeAction(unit);
            // Schedule next action
            unit.nextActionTick = this.tick + unit.speed;
        });
    }

    private executeAction(unit: Unit) {
        // Logic: Attack nearest enemy. 
        // Priority: Same Col -> Left Col -> Right Col -> ... (expanding outwards)
        // Grid is 3x3 (0-8).

        const selfCol = unit.pos % 3;

        // Define column search order: [0 (Same), -1 (Left), 1 (Right), -2, 2]
        const searchOffsets = [0, -1, 1, -2, 2];

        for (const offset of searchOffsets) {
            const targetCol = selfCol + offset;

            // Skip invalid columns
            if (targetCol < 0 || targetCol > 2) continue;

            // Find targets in this column
            const targets = this.units.filter(t =>
                t.side !== unit.side &&
                t.hp > 0 &&
                (t.pos % 3) === targetCol
            );

            if (targets.length > 0) {
                // Found targets in this column, pick the "front-most" one
                let target: Unit | null = null;

                if (unit.side === 'PLAYER') {
                    // Player attacks Front of Enemy (Row 2 -> Row 0)
                    // Enemy Indices: 0-8. Row 2 is 6,7,8.
                    targets.sort((a, b) => b.pos - a.pos);
                    target = targets[0];
                } else {
                    // Enemy attacks Front of Player (Row 0 -> Row 2)
                    // Player Indices: 0-8. Row 0 is 0,1,2.
                    targets.sort((a, b) => a.pos - b.pos);
                    target = targets[0];
                }

                if (target) {
                    this.attack(unit, target);
                    return; // Stoped after attacking first valid target
                }
            }
        }

        // If loop finishes without returning, no targets found
        // Since we scan all columns, this means no enemies are alive.
        const enemiesAlive = this.units.some(u => u.side !== unit.side && u.hp > 0);

        if (!enemiesAlive) {
            this.stopBattle();
            if (unit.side === 'PLAYER') {
                this.addLog(this.tick, '敵軍全滅！我方勝利！ (VICTORY)');
            } else {
                this.addLog(this.tick, '我軍全滅... 敗北。 (DEFEAT)');
            }
            return;
        }

        this.addLog(this.tick, `${unit.name} 前方與周圍無人，待機。`);
    }

    private attack(attacker: Unit, defender: Unit) {
        defender.hp -= attacker.atk;
        if (defender.hp < 0) defender.hp = 0;

        this.addLog(this.tick, `${attacker.name} 攻擊了 ${defender.name}，造成 ${attacker.atk} 點傷害。`);

        if (defender.hp === 0) {
            this.addLog(this.tick, `${defender.name} 被擊倒了！`);
        }
    }

    private addLog(tick: number, message: string) {
        this.logs.unshift({ tick, message });
        if (this.logs.length > 50) this.logs.pop();
    }
}
