import request from 'supertest';
import { createApp } from '../../src/app';
import { RedisClient } from '../../src/config/redis';

describe('Health Endpoints', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await RedisClient.disconnect();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: expect.any(String),
      });
    });
  });

  describe('GET /ready', () => {
    it('should return readiness status or failure based on Redis availability', async () => {
      const response = await request(app).get('/ready');

      // Accept either success (200) or failure (503) since Redis might not be available in test environment
      expect([200, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toMatchObject({
          status: 'ready',
          timestamp: expect.any(String),
          checks: {
            redis: 'ok',
          },
        });
      } else {
        expect(response.body).toMatchObject({
          status: 'not ready',
          timestamp: expect.any(String),
          checks: {
            redis: 'failed',
          },
          error: expect.any(String),
        });
      }
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200)
        .expect('Content-Type', /text\/plain/);

      expect(response.text).toContain('otp_requests_total');
      expect(response.text).toContain('otp_verifications_total');
    });
  });
});