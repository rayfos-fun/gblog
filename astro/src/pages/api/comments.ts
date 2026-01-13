import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase';
import { parse } from 'cookie';
import { getFirestore } from 'firebase-admin/firestore'; // For Timestamp

export const prerender = false;

// GET: Fetch comments for a slug
export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
        return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const commentsRef = db.collection('comments');
        const snapshot = await commentsRef
            .where('slug', '==', slug)
            .orderBy('created_at', 'desc')
            .get();

        const comments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                // Convert timestamp to ISO string
                created_at: data.created_at?.toDate().toISOString() || new Date().toISOString()
            };
        });

        return new Response(JSON.stringify(comments), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error('Error fetching comments:', e);
        return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST: Add a new comment
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

    if (!data.content || !data.slug) {
        return new Response(JSON.stringify({ error: 'Missing content or slug' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Byte length check
    if (new TextEncoder().encode(data.content).length > 1000) {
        return new Response(JSON.stringify({ error: 'Comment too long' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 3. Save to Firestore
    try {
        const commentData = {
            slug: data.slug,
            content: data.content,
            author_name: user.nickname || user.name || 'Anonymous',
            author_picture: user.picture,
            author_id: user.sub,
            created_at: FieldValue.serverTimestamp() // Use server timestamp
        };

        await db.collection('comments').add(commentData);

        return new Response(JSON.stringify({ status: 'success', message: 'Comment added' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error('Error adding comment:', e);
        return new Response(JSON.stringify({ error: 'Failed to add comment' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
