"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = void 0;
const prom_client_1 = require("prom-client");
class MetricsService {
    otpRequestsCounter;
    otpVerificationsCounter;
    otpVerificationSuccessCounter;
    otpVerificationFailureCounter;
    whatsappMessagesSentCounter;
    whatsappMessagesFailureCounter;
    httpRequestDuration;
    constructor() {
        this.otpRequestsCounter = new prom_client_1.Counter({
            name: 'otp_requests_total',
            help: 'Total number of OTP requests',
        });
        this.otpVerificationsCounter = new prom_client_1.Counter({
            name: 'otp_verifications_total',
            help: 'Total number of OTP verification attempts',
        });
        this.otpVerificationSuccessCounter = new prom_client_1.Counter({
            name: 'otp_verification_success_total',
            help: 'Total number of successful OTP verifications',
        });
        this.otpVerificationFailureCounter = new prom_client_1.Counter({
            name: 'otp_verification_failure_total',
            help: 'Total number of failed OTP verifications',
        });
        this.whatsappMessagesSentCounter = new prom_client_1.Counter({
            name: 'whatsapp_messages_sent_total',
            help: 'Total number of WhatsApp messages sent successfully',
        });
        this.whatsappMessagesFailureCounter = new prom_client_1.Counter({
            name: 'whatsapp_messages_failure_total',
            help: 'Total number of failed WhatsApp message attempts',
        });
        this.httpRequestDuration = new prom_client_1.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
        });
        prom_client_1.register.registerMetric(this.otpRequestsCounter);
        prom_client_1.register.registerMetric(this.otpVerificationsCounter);
        prom_client_1.register.registerMetric(this.otpVerificationSuccessCounter);
        prom_client_1.register.registerMetric(this.otpVerificationFailureCounter);
        prom_client_1.register.registerMetric(this.whatsappMessagesSentCounter);
        prom_client_1.register.registerMetric(this.whatsappMessagesFailureCounter);
        prom_client_1.register.registerMetric(this.httpRequestDuration);
    }
    incrementOtpRequests() {
        this.otpRequestsCounter.inc();
    }
    incrementOtpVerifications() {
        this.otpVerificationsCounter.inc();
    }
    incrementOtpVerificationSuccess() {
        this.otpVerificationSuccessCounter.inc();
    }
    incrementOtpVerificationFailure() {
        this.otpVerificationFailureCounter.inc();
    }
    incrementWhatsappMessagesSent() {
        this.whatsappMessagesSentCounter.inc();
    }
    incrementWhatsappMessagesFailure() {
        this.whatsappMessagesFailureCounter.inc();
    }
    recordHttpRequestDuration(method, route, statusCode, duration) {
        this.httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
    }
    async getMetrics() {
        return prom_client_1.register.metrics();
    }
    getRegister() {
        return prom_client_1.register;
    }
}
exports.metricsService = new MetricsService();
//# sourceMappingURL=MetricsService.js.map