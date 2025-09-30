"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const redis_1 = require("../config/redis");
const logger_1 = require("../utils/logger");
const MetricsService_1 = require("../services/MetricsService");
class HealthController {
    async health(req, res) {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
        });
    }
    async ready(req, res) {
        try {
            const redis = redis_1.RedisClient.getInstance();
            await redis.ping();
            res.status(200).json({
                status: 'ready',
                timestamp: new Date().toISOString(),
                checks: {
                    redis: 'ok',
                },
            });
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Readiness check failed');
            res.status(503).json({
                status: 'not ready',
                timestamp: new Date().toISOString(),
                checks: {
                    redis: 'failed',
                },
                error: 'Service dependencies not available',
            });
        }
    }
    async metrics(req, res) {
        try {
            const metrics = await MetricsService_1.metricsService.getMetrics();
            res.set('Content-Type', MetricsService_1.metricsService.getRegister().contentType);
            res.status(200).send(metrics);
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Failed to get metrics');
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve metrics',
            });
        }
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=healthController.js.map