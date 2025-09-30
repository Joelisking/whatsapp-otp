import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers["x-signature"]',
      'password',
      'token',
      'secret',
      'key',
      'phoneNumber',
      'phone',
    ],
    censor: '[REDACTED]',
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});

export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber.length <= 4) return '****';
  return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
}
