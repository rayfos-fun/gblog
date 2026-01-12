import { OAuth2Client } from 'google-auth-library';
import { getSecrets } from './secrets';

let oAuth2ClientInstance: OAuth2Client | null = null;

export async function getOAuthClient() {
    if (oAuth2ClientInstance) {
        return oAuth2ClientInstance;
    }

    const secrets = await getSecrets();

    const CLIENT_ID = secrets?.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = secrets?.GOOGLE_CLIENT_SECRET;

    // Redirect URI can often stay in env, or be passed in
    const REDIRECT_URI = secrets?.GOOGLE_REDIRECT_URI || import.meta.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4321/auth/callback';

    console.log('OAuth Init:', {
        hasClientId: !!CLIENT_ID,
        hasClientSecret: !!CLIENT_SECRET,
        redirectUri: REDIRECT_URI
    });

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn('Missing Google Client ID/Secret in secrets/env');
    }

    oAuth2ClientInstance = new OAuth2Client(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    return oAuth2ClientInstance;
}

export async function getAuthUrl(state?: string) {
    const client = await getOAuthClient();
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        include_granted_scopes: true,
        state
    });
}
