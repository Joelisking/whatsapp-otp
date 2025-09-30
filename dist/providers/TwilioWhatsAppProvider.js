"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioWhatsAppProvider = void 0;
const axios_1 = __importStar(require("axios"));
const WhatsAppProvider_1 = require("./WhatsAppProvider");
const logger_1 = require("../utils/logger");
class TwilioWhatsAppProvider extends WhatsAppProvider_1.BaseWhatsAppProvider {
    accountSid;
    authToken;
    fromNumber;
    baseUrl;
    constructor(accountSid, authToken, fromNumber) {
        super();
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
        this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    }
    async sendMessage(message) {
        try {
            const formattedPhoneNumber = this.formatPhoneNumber(message.to);
            const payload = new URLSearchParams({
                From: `whatsapp:${this.fromNumber}`,
                To: `whatsapp:+${formattedPhoneNumber}`,
                Body: message.message,
            });
            logger_1.logger.info({
                provider: 'twilio',
                to: this.maskPhoneNumber(message.to),
            }, 'Sending WhatsApp message via Twilio API');
            const response = await axios_1.default.post(this.baseUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: this.accountSid,
                    password: this.authToken,
                },
                timeout: 10000,
            });
            const messageId = response.data?.sid;
            logger_1.logger.info({
                provider: 'twilio',
                messageId,
                to: this.maskPhoneNumber(message.to),
            }, 'WhatsApp message sent successfully');
            return {
                success: true,
                messageId,
            };
        }
        catch (error) {
            logger_1.logger.error({
                provider: 'twilio',
                to: this.maskPhoneNumber(message.to),
                error: error instanceof axios_1.AxiosError ? error.response?.data : error,
            }, 'Failed to send WhatsApp message via Twilio API');
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    getName() {
        return 'twilio';
    }
    maskPhoneNumber(phoneNumber) {
        if (phoneNumber.length <= 4)
            return '****';
        return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
    }
}
exports.TwilioWhatsAppProvider = TwilioWhatsAppProvider;
//# sourceMappingURL=TwilioWhatsAppProvider.js.map