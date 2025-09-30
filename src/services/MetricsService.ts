import { register, Counter, Histogram } from 'prom-client';

class MetricsService {
  private readonly otpRequestsCounter: Counter<string>;
  private readonly otpVerificationsCounter: Counter<string>;
  private readonly otpVerificationSuccessCounter: Counter<string>;
  private readonly otpVerificationFailureCounter: Counter<string>;
  private readonly whatsappMessagesSentCounter: Counter<string>;
  private readonly whatsappMessagesFailureCounter: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;

  constructor() {
    this.otpRequestsCounter = new Counter({
      name: 'otp_requests_total',
      help: 'Total number of OTP requests',
    });

    this.otpVerificationsCounter = new Counter({
      name: 'otp_verifications_total',
      help: 'Total number of OTP verification attempts',
    });

    this.otpVerificationSuccessCounter = new Counter({
      name: 'otp_verification_success_total',
      help: 'Total number of successful OTP verifications',
    });

    this.otpVerificationFailureCounter = new Counter({
      name: 'otp_verification_failure_total',
      help: 'Total number of failed OTP verifications',
    });

    this.whatsappMessagesSentCounter = new Counter({
      name: 'whatsapp_messages_sent_total',
      help: 'Total number of WhatsApp messages sent successfully',
    });

    this.whatsappMessagesFailureCounter = new Counter({
      name: 'whatsapp_messages_failure_total',
      help: 'Total number of failed WhatsApp message attempts',
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    register.registerMetric(this.otpRequestsCounter);
    register.registerMetric(this.otpVerificationsCounter);
    register.registerMetric(this.otpVerificationSuccessCounter);
    register.registerMetric(this.otpVerificationFailureCounter);
    register.registerMetric(this.whatsappMessagesSentCounter);
    register.registerMetric(this.whatsappMessagesFailureCounter);
    register.registerMetric(this.httpRequestDuration);
  }

  incrementOtpRequests(): void {
    this.otpRequestsCounter.inc();
  }

  incrementOtpVerifications(): void {
    this.otpVerificationsCounter.inc();
  }

  incrementOtpVerificationSuccess(): void {
    this.otpVerificationSuccessCounter.inc();
  }

  incrementOtpVerificationFailure(): void {
    this.otpVerificationFailureCounter.inc();
  }

  incrementWhatsappMessagesSent(): void {
    this.whatsappMessagesSentCounter.inc();
  }

  incrementWhatsappMessagesFailure(): void {
    this.whatsappMessagesFailureCounter.inc();
  }

  recordHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ): void {
    this.httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  getRegister() {
    return register;
  }
}

export const metricsService = new MetricsService();
