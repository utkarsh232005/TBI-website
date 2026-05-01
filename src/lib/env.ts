// src/lib/env.ts
import 'server-only';

const requiredServerEnvs = [
  'GEMINI_API_KEY'
];

export function validateEnv() {
  const missingEnvs = requiredServerEnvs.filter((envVar) => !process.env[envVar]);

  if (missingEnvs.length > 0) {
    throw new Error(
      `❌ Invalid environment configuration:\n` +
      `Missing the following required server-side environment variables:\n` +
      missingEnvs.map((envVar) => `  - ${envVar}`).join('\n') +
      `\n\nPlease ensure these are set in your .env file or deployment environment.`
    );
  }
}

// Automatically run validation when this module is imported during server startup/execution
validateEnv();
