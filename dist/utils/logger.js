"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.maskPhoneNumber = maskPhoneNumber;
const pino_1 = __importDefault(require("pino"));
const isDevelopment = process.env.NODE_ENV === 'development';
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
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
function maskPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length <= 4)
        return '****';
    return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
}
//# sourceMappingURL=logger.js.map