"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
class RedisClient {
    static instance;
    static getInstance(redisUrl) {
        if (!RedisClient.instance) {
            RedisClient.instance = new ioredis_1.default(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
                enableReadyCheck: true,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                keepAlive: 30000,
                connectTimeout: 10000,
                commandTimeout: 5000,
            });
            RedisClient.instance.on('connect', () => {
                logger_1.logger.info('Redis client connected');
            });
            RedisClient.instance.on('ready', () => {
                logger_1.logger.info('Redis client ready');
            });
            RedisClient.instance.on('error', (error) => {
                logger_1.logger.error({ error }, 'Redis client error');
            });
            RedisClient.instance.on('close', () => {
                logger_1.logger.warn('Redis client connection closed');
            });
            RedisClient.instance.on('reconnecting', () => {
                logger_1.logger.info('Redis client reconnecting');
            });
        }
        return RedisClient.instance;
    }
    static async disconnect() {
        if (RedisClient.instance) {
            await RedisClient.instance.quit();
            RedisClient.instance = null;
        }
    }
}
exports.RedisClient = RedisClient;
//# sourceMappingURL=redis.js.map