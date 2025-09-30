import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const configSchema = z.object({
  PORT: z.string().transform(Number).default('3000'),
  REDIS_URL: z.string().optional(),
  // Railway Redis variables (actual names)
  REDISHOST: z.string().optional(),
  REDISPORT: z.string().transform(Number).optional(),
  REDISPASSWORD: z.string().optional(),
  REDISUSER: z.string().optional(),
  // Legacy variables for backward compatibility
  REDIS_PASSWORD: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().transform(Number).optional(),
  REDIS_USER: z.string().optional(),
  HMAC_SECRET: z.string().min(32),
  OTP_TTL_MINUTES: z.string().transform(Number).default('5'),
  MAX_OTP_ATTEMPTS: z.string().transform(Number).default('5'),
  COOLDOWN_SECONDS: z.string().transform(Number).default('60'),
  WHATSAPP_PROVIDER: z.enum(['meta', 'twilio']).default('meta'),

  META_ACCESS_TOKEN: z.string().optional(),
  META_PHONE_NUMBER_ID: z.string().optional(),
  META_API_VERSION: z.string().default('v18.0'),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_MAX_REQUESTS_PER_PHONE: z.string().transform(Number).default('5'),
});

const env = configSchema.parse(process.env);

// Build Redis URL from Railway components or use provided URL
function buildRedisUrl(): string {
  if (env.REDIS_URL) {
    return env.REDIS_URL;
  }

  // Try Railway's variable names first
  if (env.REDISHOST && env.REDISPORT && env.REDISPASSWORD) {
    const user = env.REDISUSER || 'default';
    return `redis://${user}:${env.REDISPASSWORD}@${env.REDISHOST}:${env.REDISPORT}`;
  }

  // Fallback to legacy variable names for backward compatibility
  if (env.REDIS_HOST && env.REDIS_PORT && env.REDIS_PASSWORD) {
    const user = env.REDIS_USER || 'default';
    return `redis://${user}:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`;
  }

  // Fallback for development
  return 'redis://localhost:6379';
}

if (env.WHATSAPP_PROVIDER === 'meta') {
  if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) {
    throw new Error(
      'META_ACCESS_TOKEN and META_PHONE_NUMBER_ID are required when using Meta provider'
    );
  }
}

if (env.WHATSAPP_PROVIDER === 'twilio') {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    throw new Error(
      'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are required when using Twilio provider'
    );
  }
}

export const config = {
  port: env.PORT,
  redisUrl: buildRedisUrl(),
  hmacSecret: env.HMAC_SECRET,
  otpTtlMinutes: env.OTP_TTL_MINUTES,
  maxOtpAttempts: env.MAX_OTP_ATTEMPTS,
  cooldownSeconds: env.COOLDOWN_SECONDS,
  whatsappProvider: env.WHATSAPP_PROVIDER,
  meta: {
    accessToken: env.META_ACCESS_TOKEN || '',
    phoneNumberId: env.META_PHONE_NUMBER_ID || '',
    apiVersion: env.META_API_VERSION,
  },
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID || '',
    authToken: env.TWILIO_AUTH_TOKEN || '',
    fromNumber: env.TWILIO_FROM_NUMBER || '',
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequestsPerWindow: env.RATE_LIMIT_MAX_REQUESTS,
    maxRequestsPerPhone: env.RATE_LIMIT_MAX_REQUESTS_PER_PHONE,
  },
};
