"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIPRateLimit = createIPRateLimit;
exports.createPhoneRateLimit = createPhoneRateLimit;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const logger_1 = require("../utils/logger");
function createIPRateLimit(redis, config) {
    return (0, express_rate_limit_1.default)({
        store: new rate_limit_redis_1.default({
            sendCommand: (...args) => {
                const [command, ...restArgs] = args;
                if (!command)
                    throw new Error('No command provided');
                return redis.call(command, ...restArgs);
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
        handler: (req, res) => {
            logger_1.logger.warn({
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
            }, 'IP rate limit exceeded');
            res.status(429).json({
                success: false,
                error: 'Too many requests from this IP. Please try again later.',
            });
        },
    });
}
function createPhoneRateLimit(redis, config) {
    return async (req, res, next) => {
        try {
            const phoneNumber = req.body?.phoneNumber;
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
                logger_1.logger.warn({
                    phoneNumber: maskPhoneNumber(phoneNumber),
                    ip: req.ip,
                    currentCount,
                    limit: config.maxRequestsPerPhone,
                }, 'Phone number rate limit exceeded');
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
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Phone rate limiting error');
            next();
        }
    };
}
function maskPhoneNumber(phoneNumber) {
    if (phoneNumber.length <= 4)
        return '****';
    return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
}
//# sourceMappingURL=rateLimit.js.map