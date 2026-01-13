import 'dotenv/config'; // Load .env file
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

let cachedSecrets: Record<string, string> | null = null;

export async function getSecrets() {
    if (cachedSecrets) {
        return cachedSecrets;
    }

    // Check if we are in development (using .env)
    // Check both process.env and import.meta.env (for Vite/Astro dev)
    const envClientId = process.env.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;
    const envClientSecret = process.env.GOOGLE_CLIENT_SECRET || import.meta.env.GOOGLE_CLIENT_SECRET;

    if (envClientId && envClientSecret) {
        console.log('Using environment variables for config.');
        cachedSecrets = {
            GOOGLE_CLIENT_ID: envClientId,
            GOOGLE_CLIENT_SECRET: envClientSecret,
            GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || import.meta.env.GOOGLE_REDIRECT_URI || 'http://localhost:4321/auth/callback',
            SECRET_KEY: process.env.SECRET_KEY || import.meta.env.SECRET_KEY || 'local-dev-secret'
        };
        return cachedSecrets;
    }

    // Otherwise, fallback to Secret Manager (Production GAE)
    try {
        const client = new SecretManagerServiceClient();
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;

        if (!projectId) {
            // Only warn if we really expected to be on GAE and failed
            console.warn('No GOOGLE_CLOUD_PROJECT found, and no local .env vars set.');
        }

        const name = `projects/${projectId}/secrets/RAYFOS_SECRET/versions/latest`;

        console.log(`Fetching secrets from ${name}...`);
        const [version] = await client.accessSecretVersion({ name });

        const payload = version.payload?.data?.toString();
        if (payload) {
            cachedSecrets = JSON.parse(payload);
            return cachedSecrets;
        }
    } catch (error) {
        console.error('Failed to load secrets from Secret Manager:', error);
    }

    return {};
}
