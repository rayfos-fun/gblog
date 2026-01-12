import type { APIRoute } from 'astro';
import { oAuth2Client } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { serialize } from 'cookie';

export const prerender = false;

export const GET: APIRoute = async ({ request, redirect }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') || '/'; // next url

    if (!code) {
        return new Response('Missing code', { status: 400 });
    }

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Verify ID Token
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: import.meta.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload) {
            throw new Error('Invalid token payload');
        }

        const { sub, name, picture, email } = payload;

        // Check Firestore for nickname
        let nickname = 'Anonymous';
        try {
            const userRef = db.collection('users').doc(sub);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                nickname = userDoc.data()?.nickname || 'Anonymous';
            }
        } catch (e) {
            console.error('Firestore error:', e);
            // Continue without nickname or with default
        }

        // Create session
        const sessionData = {
            sub,
            name,
            picture,
            email,
            nickname
        };

        // Base64 encode
        const sessionString = Buffer.from(JSON.stringify(sessionData)).toString('base64');

        // Set Cookie
        const cookie = serialize('session', sessionString, {
            httpOnly: true,
            secure: import.meta.env.PROD, // true in production
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
        });

        return new Response(null, {
            status: 302,
            headers: {
                'Location': state,
                'Set-Cookie': cookie
            }
        });

    } catch (error) {
        console.error('Auth callback error:', error);
        return new Response('Authentication failed', { status: 500 });
    }
}
