import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { RedisClient } from './config/redis';

async function startServer(): Promise<void> {
  try {
    const redis = RedisClient.getInstance(config.redisUrl);

    await redis.connect();
    logger.info('Connected to Redis');

    const app = await createApp();

    const server = app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          env: process.env.NODE_ENV || 'development',
          provider: config.whatsappProvider,
        },
        'WhatsApp OTP service started'
      );
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, starting graceful shutdown`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await RedisClient.disconnect();
          logger.info('Redis connection closed');
        } catch (error) {
          logger.error({ error }, 'Error closing Redis connection');
        }

        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forceful shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    logger.error({ error }, 'Unhandled error during startup');
    process.exit(1);
  });
}