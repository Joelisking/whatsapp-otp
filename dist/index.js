"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const redis_1 = require("./config/redis");
async function startServer() {
    try {
        const redis = redis_1.RedisClient.getInstance(config_1.config.redisUrl);
        await redis.connect();
        logger_1.logger.info('Connected to Redis');
        const app = await (0, app_1.createApp)();
        const server = app.listen(config_1.config.port, () => {
            logger_1.logger.info({
                port: config_1.config.port,
                env: process.env.NODE_ENV || 'development',
                provider: config_1.config.whatsappProvider,
            }, 'WhatsApp OTP service started');
        });
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}, starting graceful shutdown`);
            server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                try {
                    await redis_1.RedisClient.disconnect();
                    logger_1.logger.info('Redis connection closed');
                }
                catch (error) {
                    logger_1.logger.error({ error }, 'Error closing Redis connection');
                }
                process.exit(0);
            });
            setTimeout(() => {
                logger_1.logger.error('Forceful shutdown due to timeout');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
}
if (require.main === module) {
    startServer().catch((error) => {
        logger_1.logger.error({ error }, 'Unhandled error during startup');
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map