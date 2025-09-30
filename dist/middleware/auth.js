"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacAuth = hmacAuth;
exports.rawBodyParser = rawBodyParser;
const crypto_1 = require("../utils/crypto");
const logger_1 = require("../utils/logger");
function hmacAuth(secret) {
    return (req, res, next) => {
        try {
            const signature = req.get('X-Signature');
            if (!signature) {
                logger_1.logger.warn({
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path,
                }, 'HMAC authentication failed - missing signature');
                res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                });
                return;
            }
            const rawBody = req.rawBody || JSON.stringify(req.body);
            if (!(0, crypto_1.verifyHmacSignature)(rawBody, signature, secret)) {
                logger_1.logger.warn({
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path,
                }, 'HMAC authentication failed - invalid signature');
                res.status(401).json({
                    success: false,
                    error: 'Authentication failed',
                });
                return;
            }
            logger_1.logger.debug({
                ip: req.ip,
                path: req.path,
            }, 'HMAC authentication successful');
            next();
        }
        catch (error) {
            logger_1.logger.error({ error }, 'HMAC authentication error');
            res.status(500).json({
                success: false,
                error: 'Authentication error',
            });
        }
    };
}
function rawBodyParser(req, res, buf) {
    req.rawBody = buf.toString('utf8');
}
//# sourceMappingURL=auth.js.map