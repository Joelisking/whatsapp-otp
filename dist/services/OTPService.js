"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
const logger_1 = require("../utils/logger");
const crypto_1 = require("../utils/crypto");
class OTPService {
    redis;
    otpTtlMinutes;
    maxAttempts;
    cooldownSeconds;
    constructor(redis, otpTtlMinutes = 5, maxAttempts = 5, cooldownSeconds = 60) {
        this.redis = redis;
        this.otpTtlMinutes = otpTtlMinutes;
        this.maxAttempts = maxAttempts;
        this.cooldownSeconds = cooldownSeconds;
    }
    async requestOTP(request) {
        const { phoneNumber, idempotencyKey } = request;
        try {
            if (idempotencyKey) {
                const existingResponse = await this.redis.get(`idempotency:${idempotencyKey}`);
                if (existingResponse) {
                    logger_1.logger.info({ phoneNumber: this.maskPhoneNumber(phoneNumber), idempotencyKey }, 'Returning cached OTP response for idempotency key');
                    return JSON.parse(existingResponse);
                }
            }
            const cooldownKey = `cooldown:${phoneNumber}`;
            const cooldownTtl = await this.redis.ttl(cooldownKey);
            if (cooldownTtl > 0) {
                logger_1.logger.warn({ phoneNumber: this.maskPhoneNumber(phoneNumber), cooldownSeconds: cooldownTtl }, 'OTP request blocked due to cooldown');
                return {
                    success: false,
                    error: 'Too many recent requests. Please wait before requesting another OTP.',
                    cooldownSeconds: cooldownTtl,
                };
            }
            const code = (0, crypto_1.generateOTP)();
            const now = new Date();
            const expiresAt = new Date(now.getTime() + this.otpTtlMinutes * 60 * 1000);
            const otpData = {
                code,
                phoneNumber,
                attempts: 0,
                createdAt: now,
                expiresAt,
            };
            const otpKey = `otp:${phoneNumber}`;
            const ttlSeconds = this.otpTtlMinutes * 60;
            await this.redis.setex(otpKey, ttlSeconds, JSON.stringify(otpData));
            await this.redis.setex(cooldownKey, this.cooldownSeconds, '1');
            if (idempotencyKey) {
                const response = { success: true, code };
                await this.redis.setex(`idempotency:${idempotencyKey}`, ttlSeconds, JSON.stringify(response));
            }
            logger_1.logger.info({
                phoneNumber: this.maskPhoneNumber(phoneNumber),
                expiresAt: expiresAt.toISOString(),
                idempotencyKey: idempotencyKey || 'none',
            }, 'OTP generated successfully');
            return { success: true, code };
        }
        catch (error) {
            logger_1.logger.error({ error, phoneNumber: this.maskPhoneNumber(phoneNumber) }, 'Failed to generate OTP');
            return {
                success: false,
                error: 'Failed to generate OTP. Please try again.',
            };
        }
    }
    async verifyOTP(verification) {
        const { phoneNumber, code } = verification;
        try {
            const otpKey = `otp:${phoneNumber}`;
            const otpDataString = await this.redis.get(otpKey);
            if (!otpDataString) {
                logger_1.logger.warn({ phoneNumber: this.maskPhoneNumber(phoneNumber) }, 'OTP verification failed - no OTP found');
                return {
                    success: false,
                    error: 'Invalid or expired verification code.',
                };
            }
            const otpData = JSON.parse(otpDataString);
            if (new Date() > new Date(otpData.expiresAt)) {
                await this.redis.del(otpKey);
                logger_1.logger.warn({ phoneNumber: this.maskPhoneNumber(phoneNumber) }, 'OTP verification failed - expired');
                return {
                    success: false,
                    error: 'Verification code has expired.',
                };
            }
            if (otpData.attempts >= this.maxAttempts) {
                await this.redis.del(otpKey);
                logger_1.logger.warn({ phoneNumber: this.maskPhoneNumber(phoneNumber), attempts: otpData.attempts }, 'OTP verification failed - too many attempts');
                return {
                    success: false,
                    error: 'Too many invalid attempts. Please request a new verification code.',
                };
            }
            if (otpData.code !== code) {
                otpData.attempts += 1;
                const ttl = await this.redis.ttl(otpKey);
                await this.redis.setex(otpKey, ttl > 0 ? ttl : this.otpTtlMinutes * 60, JSON.stringify(otpData));
                const attemptsRemaining = this.maxAttempts - otpData.attempts;
                logger_1.logger.warn({
                    phoneNumber: this.maskPhoneNumber(phoneNumber),
                    attempts: otpData.attempts,
                    attemptsRemaining,
                }, 'OTP verification failed - invalid code');
                return {
                    success: false,
                    error: 'Invalid verification code.',
                    attemptsRemaining,
                };
            }
            await this.redis.del(otpKey);
            logger_1.logger.info({ phoneNumber: this.maskPhoneNumber(phoneNumber) }, 'OTP verified successfully');
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error({ error, phoneNumber: this.maskPhoneNumber(phoneNumber) }, 'Failed to verify OTP');
            return {
                success: false,
                error: 'Failed to verify code. Please try again.',
            };
        }
    }
    maskPhoneNumber(phoneNumber) {
        if (phoneNumber.length <= 4)
            return '****';
        return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
    }
}
exports.OTPService = OTPService;
//# sourceMappingURL=OTPService.js.map