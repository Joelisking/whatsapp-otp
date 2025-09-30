export declare const config: {
    port: number;
    redisUrl: string;
    hmacSecret: string;
    otpTtlMinutes: number;
    maxOtpAttempts: number;
    cooldownSeconds: number;
    whatsappProvider: "meta" | "twilio";
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
};
//# sourceMappingURL=index.d.ts.map