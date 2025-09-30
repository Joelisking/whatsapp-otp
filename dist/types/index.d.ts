export interface OTPRequest {
    phoneNumber: string;
    idempotencyKey?: string;
}
export interface OTPVerification {
    phoneNumber: string;
    code: string;
}
export interface OTPData {
    code: string;
    phoneNumber: string;
    attempts: number;
    createdAt: Date;
    expiresAt: Date;
}
export interface WhatsAppMessage {
    to: string;
    message: string;
    otpCode?: string;
}
export interface WhatsAppProvider {
    sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
    getName(): string;
}
export interface WhatsAppSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: Date;
}
export interface Config {
    port: number;
    redisUrl: string;
    hmacSecret: string;
    otpTtlMinutes: number;
    maxOtpAttempts: number;
    cooldownSeconds: number;
    whatsappProvider: 'meta' | 'twilio';
    meta: {
        accessToken: string;
        phoneNumberId: string;
        apiVersion: string;
    };
    twilio: {
        accountSid: string;
        authToken: string;
        fromNumber: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequestsPerWindow: number;
        maxRequestsPerPhone: number;
    };
}
export interface MetricsData {
    otpRequests: number;
    otpVerifications: number;
    otpVerificationSuccess: number;
    otpVerificationFailure: number;
    whatsappMessagesSent: number;
    whatsappMessagesFailure: number;
}
//# sourceMappingURL=index.d.ts.map