import { Request, Response } from 'express';
import { z } from 'zod';
import { OTPService } from '../services/OTPService';
import { WhatsAppProvider } from '../types';
import { logger, maskPhoneNumber } from '../utils/logger';
import { metricsService } from '../services/MetricsService';

const otpRequestSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
});

const otpVerifySchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only digits'),
});

export class OTPController {
  constructor(
    private readonly otpService: OTPService,
    private readonly whatsappProvider: WhatsAppProvider
  ) {}

  async requestOTP(req: Request, res: Response): Promise<void> {
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

      logger.info(
        {
          phoneNumber: maskPhoneNumber(phoneNumber),
          idempotencyKey: idempotencyKey || 'none',
          ip: req.ip,
        },
        'OTP request received'
      );

      const otpRequest = idempotencyKey ? { phoneNumber, idempotencyKey } : { phoneNumber };

      const otpResult = await this.otpService.requestOTP(otpRequest);

      metricsService.incrementOtpRequests();

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
        message: this.createOTPMessage(otpResult.code!),
        otpCode: otpResult.code!,
      });

      if (!messageResult.success) {
        logger.error(
          {
            phoneNumber: maskPhoneNumber(phoneNumber),
            error: messageResult.error,
          },
          'Failed to send WhatsApp message'
        );

        metricsService.incrementWhatsappMessagesFailure();

        res.status(500).json({
          success: false,
          error: 'Failed to send verification code. Please try again.',
        });
        return;
      }

      metricsService.incrementWhatsappMessagesSent();

      logger.info(
        {
          phoneNumber: maskPhoneNumber(phoneNumber),
          messageId: messageResult.messageId,
          provider: this.whatsappProvider.getName(),
        },
        'OTP sent successfully'
      );

      res.status(200).json({
        success: true,
        message: 'Verification code sent successfully',
        ...(messageResult.messageId && { messageId: messageResult.messageId }),
      });
    } catch (error) {
      logger.error({ error }, 'Error in requestOTP');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
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

      logger.info(
        {
          phoneNumber: maskPhoneNumber(phoneNumber),
          ip: req.ip,
        },
        'OTP verification request received'
      );

      const verificationResult = await this.otpService.verifyOTP({
        phoneNumber,
        code,
      });

      metricsService.incrementOtpVerifications();

      if (!verificationResult.success) {
        metricsService.incrementOtpVerificationFailure();

        res.status(400).json({
          success: false,
          error: verificationResult.error,
          ...(typeof verificationResult.attemptsRemaining === 'number' && {
            attemptsRemaining: verificationResult.attemptsRemaining,
          }),
        });
        return;
      }

      metricsService.incrementOtpVerificationSuccess();

      logger.info(
        {
          phoneNumber: maskPhoneNumber(phoneNumber),
        },
        'OTP verified successfully'
      );

      res.status(200).json({
        success: true,
        message: 'Verification successful',
      });
    } catch (error) {
      logger.error({ error }, 'Error in verifyOTP');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  private createOTPMessage(code: string): string {
    return `Your verification code is: ${code}. This code will expire in 5 minutes. Do not share this code with anyone.`;
  }
}
