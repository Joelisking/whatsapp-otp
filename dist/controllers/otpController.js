"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPController = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const MetricsService_1 = require("../services/MetricsService");
const otpRequestSchema = zod_1.z.object({
    phoneNumber: zod_1.z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number must be at most 15 digits')
        .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
});
const otpVerifySchema = zod_1.z.object({
    phoneNumber: zod_1.z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number must be at most 15 digits')
        .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
    code: zod_1.z
        .string()
        .length(6, 'Verification code must be 6 digits')
        .regex(/^\d{6}$/, 'Verification code must contain only digits'),
});
class OTPController {
    otpService;
    whatsappProvider;
    constructor(otpService, whatsappProvider) {
        this.otpService = otpService;
        this.whatsappProvider = whatsappProvider;
    }
    async requestOTP(req, res) {
        try {
            const idempotencyKey = req.get('Idempotency-Key');
            const validation = otpRequestSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid request data',
                    details: validation.error.errors,
                });
                return;
            }
            const { phoneNumber } = validation.data;
            logger_1.logger.info({
                phoneNumber: (0, logger_1.maskPhoneNumber)(phoneNumber),
                idempotencyKey: idempotencyKey || 'none',
                ip: req.ip,
            }, 'OTP request received');
            const otpRequest = idempotencyKey ? { phoneNumber, idempotencyKey } : { phoneNumber };
            const otpResult = await this.otpService.requestOTP(otpRequest);
            MetricsService_1.metricsService.incrementOtpRequests();
            if (!otpResult.success) {
                res.status(400).json({
                    success: false,
                    error: otpResult.error,
                    ...(otpResult.cooldownSeconds && { retryAfter: otpResult.cooldownSeconds }),
                });
                return;
            }
            const messageResult = await this.whatsappProvider.sendMessage({
                to: phoneNumber,
                message: this.createOTPMessage(otpResult.code),
            });
            if (!messageResult.success) {
                logger_1.logger.error({
                    phoneNumber: (0, logger_1.maskPhoneNumber)(phoneNumber),
                    error: messageResult.error,
                }, 'Failed to send WhatsApp message');
                MetricsService_1.metricsService.incrementWhatsappMessagesFailure();
                res.status(500).json({
                    success: false,
                    error: 'Failed to send verification code. Please try again.',
                });
                return;
            }
            MetricsService_1.metricsService.incrementWhatsappMessagesSent();
            logger_1.logger.info({
                phoneNumber: (0, logger_1.maskPhoneNumber)(phoneNumber),
                messageId: messageResult.messageId,
                provider: this.whatsappProvider.getName(),
            }, 'OTP sent successfully');
            res.status(200).json({
                success: true,
                message: 'Verification code sent successfully',
                ...(messageResult.messageId && { messageId: messageResult.messageId }),
            });
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Error in requestOTP');
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
    async verifyOTP(req, res) {
        try {
            const validation = otpVerifySchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid request data',
                    details: validation.error.errors,
                });
                return;
            }
            const { phoneNumber, code } = validation.data;
            logger_1.logger.info({
                phoneNumber: (0, logger_1.maskPhoneNumber)(phoneNumber),
                ip: req.ip,
            }, 'OTP verification request received');
            const verificationResult = await this.otpService.verifyOTP({
                phoneNumber,
                code,
            });
            MetricsService_1.metricsService.incrementOtpVerifications();
            if (!verificationResult.success) {
                MetricsService_1.metricsService.incrementOtpVerificationFailure();
                res.status(400).json({
                    success: false,
                    error: verificationResult.error,
                    ...(typeof verificationResult.attemptsRemaining === 'number' && {
                        attemptsRemaining: verificationResult.attemptsRemaining,
                    }),
                });
                return;
            }
            MetricsService_1.metricsService.incrementOtpVerificationSuccess();
            logger_1.logger.info({
                phoneNumber: (0, logger_1.maskPhoneNumber)(phoneNumber),
            }, 'OTP verified successfully');
            res.status(200).json({
                success: true,
                message: 'Verification successful',
            });
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Error in verifyOTP');
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
    createOTPMessage(code) {
        return `Your verification code is: ${code}. This code will expire in 5 minutes. Do not share this code with anyone.`;
    }
}
exports.OTPController = OTPController;
//# sourceMappingURL=otpController.js.map