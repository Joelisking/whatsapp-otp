"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const configSchema = zod_1.z.object({
    PORT: zod_1.z.string().transform(Number).default('3000'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    HMAC_SECRET: zod_1.z.string().min(32),
    OTP_TTL_MINUTES: zod_1.z.string().transform(Number).default('5'),
    MAX_OTP_ATTEMPTS: zod_1.z.string().transform(Number).default('5'),
    COOLDOWN_SECONDS: zod_1.z.string().transform(Number).default('60'),
    WHATSAPP_PROVIDER: zod_1.z.enum(['meta', 'twilio']).default('meta'),
    META_ACCESS_TOKEN: zod_1.z.string().optional(),
    META_PHONE_NUMBER_ID: zod_1.z.string().optional(),
    META_API_VERSION: zod_1.z.string().default('v18.0'),
    TWILIO_ACCOUNT_SID: zod_1.z.string().optional(),
    TWILIO_AUTH_TOKEN: zod_1.z.string().optional(),
    TWILIO_FROM_NUMBER: zod_1.z.string().optional(),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default('900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default('100'),
    RATE_LIMIT_MAX_REQUESTS_PER_PHONE: zod_1.z.string().transform(Number).default('5'),
});
const env = configSchema.parse(process.env);
if (env.WHATSAPP_PROVIDER === 'meta') {
    if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) {
        throw new Error('META_ACCESS_TOKEN and META_PHONE_NUMBER_ID are required when using Meta provider');
    }
}
if (env.WHATSAPP_PROVIDER === 'twilio') {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
        throw new Error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are required when using Twilio provider');
    }
}
exports.config = {
    port: env.PORT,
    redisUrl: env.REDIS_URL,
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
//# sourceMappingURL=index.js.map