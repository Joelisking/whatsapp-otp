// src/lib/redis.ts
import Redis from 'ioredis';
import { logger } from '../utils/logger';

function sanitizeRedisUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.password) u.password = '*****';
    return `${u.protocol}//${u.username ? `${u.username}:*****@` : ''}${u.host}${u.pathname}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}

export class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      // Only support REDIS_URL (Railway provides this). Fail fast if missing.
      const url = process.env.REDIS_URL;
      if (!url) {
        // In local/dev you can set REDIS_URL=redis://localhost:6379
        throw new Error(
          'REDIS_URL is not set. On Railway, add a Variable Reference to your Redis service "REDIS_URL".'
        );
      }

      logger.info({ redisUrl: sanitizeRedisUrl(url) }, 'Initializing Redis client with REDIS_URL');

      RedisClient.instance = new Redis(url, {
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30_000,
        connectTimeout: 10_000,
        commandTimeout: 5_000,
        family: 0, // Support both IPv4 and IPv6 (required for Railway)
        // retryStrategy: (times) => Math.min(1000 * times, 15_000), // optional: backoff
        // enableOfflineQueue: false, // optional: fail fast if disconnected
      });

      RedisClient.instance.on('connect', () => {
        logger.info('Redis client connected');
      });

      RedisClient.instance.on('ready', () => {
        logger.info('Redis client ready');
      });

      RedisClient.instance.on('error', (error) => {
        logger.error({ error }, 'Redis client error');
      });

      RedisClient.instance.on('close', () => {
        logger.warn('Redis client connection closed');
      });

      RedisClient.instance.on('reconnecting', () => {
        logger.info('Redis client reconnecting');
      });
    }

    return RedisClient.instance!;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
    }
  }
}
