import { Request, Response, NextFunction } from 'express';
import { verifyHmacSignature } from '../utils/crypto';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  rawBody?: string;
}

export function hmacAuth(secret: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const signature = req.get('X-Signature');

      if (!signature) {
        logger.warn(
          {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
          },
          'HMAC authentication failed - missing signature'
        );
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const rawBody = req.rawBody || JSON.stringify(req.body);

      if (!verifyHmacSignature(rawBody, signature, secret)) {
        logger.warn(
          {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
          },
          'HMAC authentication failed - invalid signature'
        );
        res.status(401).json({
          success: false,
          error: 'Authentication failed',
        });
        return;
      }

      logger.debug(
        {
          ip: req.ip,
          path: req.path,
        },
        'HMAC authentication successful'
      );

      next();
    } catch (error) {
      logger.error({ error }, 'HMAC authentication error');
      res.status(500).json({
        success: false,
        error: 'Authentication error',
      });
    }
  };
}

export function rawBodyParser(req: AuthenticatedRequest, res: Response, buf: Buffer): void {
  req.rawBody = buf.toString('utf8');
}
