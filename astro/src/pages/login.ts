import type { APIRoute } from 'astro';
import { getAuthUrl } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ redirect, url }) => {
    // Store the return URL in a 'next' cookie or state
    // For simplicity, we just flow.
    // main.py supports ?next=...

    const next = url.searchParams.get('next') || '/';
    // We could encode 'next' in the state param

    const authUrl = getAuthUrl(next);

    return redirect(authUrl);
}
