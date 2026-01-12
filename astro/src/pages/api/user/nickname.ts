import type { APIRoute } from 'astro';
import { db } from '@/lib/firebase';
import { parse, serialize } from 'cookie';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    // 1. Check Auth
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parse(cookieHeader);
    const sessionCookie = cookies['session'];

    if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let user;
    try {
        user = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Validate Input
    let data;
    try {
        data = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }

    const newNickname = (data.nickname || '').trim();

    if (newNickname.length < 1 || newNickname.length > 20) {
        return new Response(JSON.stringify({ error: 'Nickname must be between 1 and 20 characters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 3. Update Firestore
        // Assuming user.sub is the doc ID as per callback.ts
        const userRef = db.collection('users').doc(user.sub);

        // Use set with merge: true in case the doc doesn't exist (though it should)
        await userRef.set({ nickname: newNickname }, { merge: true });

        // 4. Update Session Cookie
        user.nickname = newNickname;
        const newSessionString = Buffer.from(JSON.stringify(user)).toString('base64');

        const newCookie = serialize('session', newSessionString, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
        });

        return new Response(JSON.stringify({ status: 'success', nickname: newNickname }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': newCookie
            }
        });

    } catch (e) {
        console.error('Error updating nickname:', e);
        return new Response(JSON.stringify({ error: 'Failed to update nickname' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
