import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

let cachedSecrets: Record<string, string> | null = null;

export async function getSecrets() {
    if (cachedSecrets) {
        return cachedSecrets;
    }

    // Check if we are in development (using .env)
    // We can use a heuristic: if GOOGLE_CLIENT_ID is already set in process.env, use that.
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        console.log('Using environment variables for config.');
        cachedSecrets = {
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
            // Default to env or specific local fallback logic if needed
            SECRET_KEY: process.env.SECRET_KEY || 'local-dev-secret'
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
