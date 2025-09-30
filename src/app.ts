import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './utils/logger';
import { RedisClient } from './config/redis';
import { OTPService } from './services/OTPService';
import { OTPController } from './controllers/otpController';
import { HealthController } from './controllers/healthController';
import { DocsController } from './controllers/docsController';
import { MetaWhatsAppProvider, TwilioWhatsAppProvider } from './providers';
import { hmacAuth, rawBodyParser } from './middleware/auth';
import { createIPRateLimit, createPhoneRateLimit } from './middleware/rateLimit';
import { metricsService } from './services/MetricsService';

export async function createApp(): Promise<express.Application> {
  const app = express();

  await DocsController.initialize();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  );

  app.use(compression());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
      credentials: true,
    })
  );

  app.use(
    pinoHttp({
      logger,
      customLogLevel: (req, res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        } else if (res.statusCode >= 500 || err) {
          return 'error';
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
          return 'silent';
        }
        return 'info';
      },
      customSuccessMessage: (req, res) => {
        if (res.statusCode === 404) {
          return 'Resource not found';
        }
        return `${req.method} ${req.url}`;
      },
      customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} - ${err.message}`;
      },
    })
  );

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      metricsService.recordHttpRequestDuration(
        req.method,
        req.route?.path || req.path,
        res.statusCode,
        duration
      );
    });
    next();
  });

  const redis = RedisClient.getInstance();

  const ipRateLimit = createIPRateLimit(redis, config.rateLimit);
  const phoneRateLimit = createPhoneRateLimit(redis, config.rateLimit);

  app.use(
    express.json({
      limit: '10mb',
      verify: rawBodyParser,
    })
  );

  const whatsappProvider =
    config.whatsappProvider === 'meta'
      ? new MetaWhatsAppProvider(
          config.meta.accessToken,
          config.meta.phoneNumberId,
          config.meta.apiVersion
        )
      : new TwilioWhatsAppProvider(
          config.twilio.accountSid,
          config.twilio.authToken,
          config.twilio.fromNumber
        );

  const otpService = new OTPService(
    redis,
    config.otpTtlMinutes,
    config.maxOtpAttempts,
    config.cooldownSeconds
  );

  const otpController = new OTPController(otpService, whatsappProvider);
  const healthController = new HealthController();
  const docsController = new DocsController();

  app.get('/health', healthController.health.bind(healthController));
  app.get('/ready', healthController.ready.bind(healthController));
  app.get('/metrics', healthController.metrics.bind(healthController));

  app.use('/docs', DocsController.getSwaggerServe(), DocsController.getSwaggerSetup());
  app.get('/api-spec', docsController.getApiSpec.bind(docsController));

  const otpRouter = express.Router();
  otpRouter.use(ipRateLimit);
  otpRouter.use(phoneRateLimit);

  // Only require HMAC auth in production
  if (process.env.NODE_ENV === 'production') {
    otpRouter.use(hmacAuth(config.hmacSecret));
  } else {
    logger.info('Running in development mode - HMAC authentication disabled');
  }

  otpRouter.post('/request', otpController.requestOTP.bind(otpController));
  otpRouter.post('/verify', otpController.verifyOTP.bind(otpController));

  app.use('/otp', otpRouter);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
    });
  });

  app.use(
    (err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      logger.error({ err, req: { method: req.method, url: req.url } }, 'Unhandled error');

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  );

  return app;
}
