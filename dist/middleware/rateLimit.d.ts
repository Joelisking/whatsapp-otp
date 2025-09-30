import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
interface RateLimitConfig {
    windowMs: number;
    maxRequestsPerWindow: number;
    maxRequestsPerPhone: number;
}
export declare function createIPRateLimit(redis: Redis, config: RateLimitConfig): import("express-rate-limit").RateLimitRequestHandler;
export declare function createPhoneRateLimit(redis: Redis, config: RateLimitConfig): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=rateLimit.d.ts.map