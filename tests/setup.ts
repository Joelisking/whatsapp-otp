import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.HMAC_SECRET = 'test-secret-key-for-testing-purposes-only';
process.env.META_ACCESS_TOKEN = 'test-meta-token';
process.env.META_PHONE_NUMBER_ID = 'test-phone-id';
process.env.WHATSAPP_PROVIDER = 'meta';