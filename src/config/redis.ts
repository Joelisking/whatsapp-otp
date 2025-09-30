import Redis from 'ioredis';
import { logger } from '../utils/logger';

export class RedisClient {
  private static instance: Redis;

  static getInstance(redisUrl?: string): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(
        redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
        {
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          keepAlive: 30000,
          connectTimeout: 10000,
          commandTimeout: 5000,
        }
      );

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

    return RedisClient.instance;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null as unknown as Redis;
    }
  }
}
