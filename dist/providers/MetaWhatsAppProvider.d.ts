import { BaseWhatsAppProvider } from './WhatsAppProvider';
import { WhatsAppMessage, WhatsAppSendResult } from '../types';
export declare class MetaWhatsAppProvider extends BaseWhatsAppProvider {
    private readonly accessToken;
    private readonly phoneNumberId;
    private readonly apiVersion;
    private readonly baseUrl;
    constructor(accessToken: string, phoneNumberId: string, apiVersion?: string);
    sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
    getName(): string;
    private maskPhoneNumber;
}
//# sourceMappingURL=MetaWhatsAppProvider.d.ts.map