import { WhatsAppMessage, WhatsAppProvider, WhatsAppSendResult } from '../types';
export declare abstract class BaseWhatsAppProvider implements WhatsAppProvider {
    abstract sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
    abstract getName(): string;
    protected formatPhoneNumber(phoneNumber: string): string;
    protected createOTPMessage(code: string): string;
}
//# sourceMappingURL=WhatsAppProvider.d.ts.map