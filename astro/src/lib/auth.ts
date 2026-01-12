import { OAuth2Client } from 'google-auth-library';
import { getSecrets } from './secrets';

export async function createOAuthClient(requestUrl?: URL) {
    const secrets = await getSecrets();
    const CLIENT_ID = secrets?.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = secrets?.GOOGLE_CLIENT_SECRET;

    // 1. Try environment / secret
    let redirectUri = secrets?.GOOGLE_REDIRECT_URI || import.meta.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

    // Safety check: specific to preventing localhost redirect in production
    // If we have a requestUrl that isn't localhost, but the config is localhost, ignore the config.
    if (redirectUri && redirectUri.includes('localhost') && requestUrl && !requestUrl.hostname.includes('localhost')) {
        console.warn('Ignoring localhost redirect_uri in production context');
        redirectUri = undefined;
    }

    // 2. Fallback to constructing from request origin (most robust for dynamic hosts)
    if (!redirectUri && requestUrl) {
        redirectUri = `${requestUrl.origin}/auth/callback`;
    }

    // 3. Fallback to localhost default
    if (!redirectUri) {
        redirectUri = 'http://localhost:4321/auth/callback';
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn('Missing Google Client ID/Secret in secrets/env');
    }

    // Debug (optional, remove in strict prod if too noisy)
    // console.log('Creating OAuth Client with redirect:', redirectUri);

    return new OAuth2Client(
        CLIENT_ID,
        CLIENT_SECRET,
        redirectUri
    );
}

export async function getAuthUrl(requestUrl: URL, state?: string) {
    const client = await createOAuthClient(requestUrl);
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        include_granted_scopes: true,
        state
    });
}
