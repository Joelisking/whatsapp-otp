import Redis from 'ioredis';
import { OTPRequest, OTPVerification } from '../types';
export declare class OTPService {
    private readonly redis;
    private readonly otpTtlMinutes;
    private readonly maxAttempts;
    private readonly cooldownSeconds;
    constructor(redis: Redis, otpTtlMinutes?: number, maxAttempts?: number, cooldownSeconds?: number);
    requestOTP(request: OTPRequest): Promise<{
        success: boolean;
        code?: string;
        error?: string;
        cooldownSeconds?: number;
    }>;
    verifyOTP(verification: OTPVerification): Promise<{
        success: boolean;
        error?: string;
        attemptsRemaining?: number;
    }>;
    private maskPhoneNumber;
}
//# sourceMappingURL=OTPService.d.ts.map