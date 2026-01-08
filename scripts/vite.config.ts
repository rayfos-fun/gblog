import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToScan = ['games', 'tools'];
const inputs = {};

dirsToScan.forEach((dirName) => {
  const fullDirPath = path.resolve(__dirname, 'src', dirName);

  // 1. 先檢查資料夾是否存在，避免報錯
  if (fs.existsSync(fullDirPath)) {
    const files = fs.readdirSync(fullDirPath);

    files.forEach((file) => {
      if (file.endsWith('.ts')) {
        const name = path.basename(file, '.ts');
        
        // 🔑 關鍵修改：Key 包含了資料夾名稱 (e.g., 'games/tower-of-hanoi')
        // 這會讓 Vite 在輸出時自動建立對應的子資料夾
        const entryKey = `${dirName}/${name}`;
        
        inputs[entryKey] = path.resolve(fullDirPath, file);
      }
    });
  }
});

export default defineConfig({
  build: {
    outDir: '../jekyll-site/assets/js',
    emptyOutDir: true,
    rollupOptions: {
      input: inputs,
      output: {
        entryFileNames: '[name].js', 
        assetFileNames: '[name].[ext]',
      }
    }
  }
});