declare class MetricsService {
    private readonly otpRequestsCounter;
    private readonly otpVerificationsCounter;
    private readonly otpVerificationSuccessCounter;
    private readonly otpVerificationFailureCounter;
    private readonly whatsappMessagesSentCounter;
    private readonly whatsappMessagesFailureCounter;
    private readonly httpRequestDuration;
    constructor();
    incrementOtpRequests(): void;
    incrementOtpVerifications(): void;
    incrementOtpVerificationSuccess(): void;
    incrementOtpVerificationFailure(): void;
    incrementWhatsappMessagesSent(): void;
    incrementWhatsappMessagesFailure(): void;
    recordHttpRequestDuration(method: string, route: string, statusCode: number, duration: number): void;
    getMetrics(): Promise<string>;
    getRegister(): import("prom-client").Registry<"text/plain; version=0.0.4; charset=utf-8">;
}
export declare const metricsService: MetricsService;
export {};
//# sourceMappingURL=MetricsService.d.ts.map