import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
// Default to localhost for dev, but this should be configured
const REDIRECT_URI = import.meta.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || 'http://127.0.0.1:4321/auth/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env variables.');
}

export const oAuth2Client = new OAuth2Client(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

export function getAuthUrl(state?: string) {
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        include_granted_scopes: true,
        state
    });
}
