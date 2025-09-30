"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const pino_http_1 = __importDefault(require("pino-http"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const redis_1 = require("./config/redis");
const OTPService_1 = require("./services/OTPService");
const otpController_1 = require("./controllers/otpController");
const healthController_1 = require("./controllers/healthController");
const docsController_1 = require("./controllers/docsController");
const providers_1 = require("./providers");
const auth_1 = require("./middleware/auth");
const rateLimit_1 = require("./middleware/rateLimit");
const MetricsService_1 = require("./services/MetricsService");
async function createApp() {
    const app = (0, express_1.default)();
    await docsController_1.DocsController.initialize();
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));
    app.use((0, compression_1.default)());
    app.use((0, cors_1.default)({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
        credentials: true,
    }));
    app.use((0, pino_http_1.default)({
        logger: logger_1.logger,
        customLogLevel: (req, res, err) => {
            if (res.statusCode >= 400 && res.statusCode < 500) {
                return 'warn';
            }
            else if (res.statusCode >= 500 || err) {
                return 'error';
            }
            else if (res.statusCode >= 300 && res.statusCode < 400) {
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
    }));
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = (Date.now() - start) / 1000;
            MetricsService_1.metricsService.recordHttpRequestDuration(req.method, req.route?.path || req.path, res.statusCode, duration);
        });
        next();
    });
    const redis = redis_1.RedisClient.getInstance(config_1.config.redisUrl);
    const ipRateLimit = (0, rateLimit_1.createIPRateLimit)(redis, config_1.config.rateLimit);
    const phoneRateLimit = (0, rateLimit_1.createPhoneRateLimit)(redis, config_1.config.rateLimit);
    app.use(express_1.default.json({
        limit: '10mb',
        verify: auth_1.rawBodyParser,
    }));
    const whatsappProvider = config_1.config.whatsappProvider === 'meta'
        ? new providers_1.MetaWhatsAppProvider(config_1.config.meta.accessToken, config_1.config.meta.phoneNumberId, config_1.config.meta.apiVersion)
        : new providers_1.TwilioWhatsAppProvider(config_1.config.twilio.accountSid, config_1.config.twilio.authToken, config_1.config.twilio.fromNumber);
    const otpService = new OTPService_1.OTPService(redis, config_1.config.otpTtlMinutes, config_1.config.maxOtpAttempts, config_1.config.cooldownSeconds);
    const otpController = new otpController_1.OTPController(otpService, whatsappProvider);
    const healthController = new healthController_1.HealthController();
    const docsController = new docsController_1.DocsController();
    app.get('/health', healthController.health.bind(healthController));
    app.get('/ready', healthController.ready.bind(healthController));
    app.get('/metrics', healthController.metrics.bind(healthController));
    app.use('/docs', docsController_1.DocsController.getSwaggerServe(), docsController_1.DocsController.getSwaggerSetup());
    app.get('/api-spec', docsController.getApiSpec.bind(docsController));
    const otpRouter = express_1.default.Router();
    otpRouter.use(ipRateLimit);
    otpRouter.use(phoneRateLimit);
    otpRouter.use((0, auth_1.hmacAuth)(config_1.config.hmacSecret));
    otpRouter.post('/request', otpController.requestOTP.bind(otpController));
    otpRouter.post('/verify', otpController.verifyOTP.bind(otpController));
    app.use('/otp', otpRouter);
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Endpoint not found',
        });
    });
    app.use((err, req, res, _next) => {
        logger_1.logger.error({ err, req: { method: req.method, url: req.url } }, 'Unhandled error');
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    });
    return app;
}
//# sourceMappingURL=app.js.map