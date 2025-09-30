import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequestsPerWindow: number;
  maxRequestsPerPhone: number;
}

export function createIPRateLimit(redis: Redis, config: RateLimitConfig) {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => {
        const [command, ...restArgs] = args;
        if (!command) throw new Error('No command provided');
        return redis.call(command, ...restArgs) as any;
      },
    }),
    windowMs: config.windowMs,
    max: config.maxRequestsPerWindow,
    message: {
      success: false,
      error: 'Too many requests from this IP. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn(
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
        },
        'IP rate limit exceeded'
      );
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP. Please try again later.',
      });
    },
  });
}

export function createPhoneRateLimit(redis: Redis, config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const phoneNumber = req.body?.phoneNumber as string;

      if (!phoneNumber) {
        next();
        return;
      }

      const key = `phone_rate_limit:${phoneNumber}`;
      const windowStart = Math.floor(Date.now() / config.windowMs) * config.windowMs;
      const windowKey = `${key}:${windowStart}`;

      const currentCount = await redis.incr(windowKey);

      if (currentCount === 1) {
        await redis.expire(windowKey, Math.ceil(config.windowMs / 1000));
      }

      if (currentCount > config.maxRequestsPerPhone) {
        logger.warn(
          {
            phoneNumber: maskPhoneNumber(phoneNumber),
            ip: req.ip,
            currentCount,
            limit: config.maxRequestsPerPhone,
          },
          'Phone number rate limit exceeded'
        );

        res.status(429).json({
          success: false,
          error: 'Too many requests for this phone number. Please try again later.',
        });
        return;
      }

      const remaining = config.maxRequestsPerPhone - currentCount;
      const resetTime = new Date(windowStart + config.windowMs);

      res.set({
        'X-RateLimit-Limit-Phone': config.maxRequestsPerPhone.toString(),
        'X-RateLimit-Remaining-Phone': remaining.toString(),
        'X-RateLimit-Reset-Phone': resetTime.toISOString(),
      });

      next();
    } catch (error) {
      logger.error({ error }, 'Phone rate limiting error');
      next();
    }
  };
}

function maskPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length <= 4) return '****';
  return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
}
