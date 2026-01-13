import type { APIRoute } from 'astro';
import { serialize } from 'cookie';

export const prerender = false;

export const GET: APIRoute = async ({ redirect }) => {
    const cookie = serialize('session', '', {
        httpOnly: true,
        secure: import.meta.env.PROD,
        maxAge: -1, // Expire immediately
        path: '/'
    });

    return new Response(null, {
        status: 302,
        headers: {
            'Location': '/',
            'Set-Cookie': cookie
        }
    });
}
