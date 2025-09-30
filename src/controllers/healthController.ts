import { Request, Response } from 'express';
import { RedisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { metricsService } from '../services/MetricsService';

export class HealthController {
  async health(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    });
  }

  async ready(req: Request, res: Response): Promise<void> {
    try {
      const redis = RedisClient.getInstance();

      await redis.ping();

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          redis: 'ok',
        },
      });
    } catch (error) {
      logger.error({ error }, 'Readiness check failed');

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

  async metrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await metricsService.getMetrics();

      res.set('Content-Type', metricsService.getRegister().contentType);
      res.status(200).send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to get metrics');
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics',
      });
    }
  }
}
