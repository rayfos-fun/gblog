import type { APIRoute } from 'astro';
import { parse } from 'cookie';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parse(cookieHeader);
    const sessionCookie = cookies['session'];

    if (!sessionCookie) {
        return new Response(JSON.stringify({ authed: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // In a real app, verify signature here
        const sessionData = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));

        // Check expiration if added

        return new Response(JSON.stringify({
            authed: true,
            name: sessionData.name,
            picture: sessionData.picture,
            sub: sessionData.sub,
            nickname: sessionData.nickname || 'Anonymous'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error('Session parse error', e);
        return new Response(JSON.stringify({ authed: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
