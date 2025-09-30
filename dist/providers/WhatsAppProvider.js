"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseWhatsAppProvider = void 0;
class BaseWhatsAppProvider {
    formatPhoneNumber(phoneNumber) {
        let formatted = phoneNumber.replace(/\D/g, '');
        if (!formatted.startsWith('1') && formatted.length === 10) {
            formatted = '1' + formatted;
        }
        return formatted;
    }
    createOTPMessage(code) {
        return `Your verification code is: ${code}. This code will expire in 5 minutes. Do not share this code with anyone.`;
    }
}
exports.BaseWhatsAppProvider = BaseWhatsAppProvider;
//# sourceMappingURL=WhatsAppProvider.js.map