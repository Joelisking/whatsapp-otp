import { BaseWhatsAppProvider } from './WhatsAppProvider';
import { WhatsAppMessage, WhatsAppSendResult } from '../types';
export declare class TwilioWhatsAppProvider extends BaseWhatsAppProvider {
    private readonly accountSid;
    private readonly authToken;
    private readonly fromNumber;
    private readonly baseUrl;
    constructor(accountSid: string, authToken: string, fromNumber: string);
    sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
    getName(): string;
    private maskPhoneNumber;
}
//# sourceMappingURL=TwilioWhatsAppProvider.d.ts.map