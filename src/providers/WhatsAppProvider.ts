import { WhatsAppMessage, WhatsAppProvider, WhatsAppSendResult } from '../types';

export abstract class BaseWhatsAppProvider implements WhatsAppProvider {
  abstract sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
  abstract getName(): string;

  protected formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/\D/g, '');

    if (!formatted.startsWith('1') && formatted.length === 10) {
      formatted = '1' + formatted;
    }

    return formatted;
  }

  protected createOTPMessage(code: string): string {
    return `Your verification code is: ${code}. This code will expire in 5 minutes. Do not share this code with anyone.`;
  }
}
