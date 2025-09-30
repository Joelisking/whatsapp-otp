"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.verifyHmacSignature = verifyHmacSignature;
const crypto_1 = require("crypto");
function generateOTP() {
    return (0, crypto_1.randomInt)(100000, 999999).toString();
}
function verifyHmacSignature(payload, signature, secret) {
    try {
        const computedSignature = (0, crypto_1.createHmac)('sha256', secret).update(payload, 'utf8').digest('hex');
        const expectedSignature = `sha256=${computedSignature}`;
        return timingSafeEquals(expectedSignature, signature);
    }
    catch {
        return false;
    }
}
function timingSafeEquals(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
//# sourceMappingURL=crypto.js.map