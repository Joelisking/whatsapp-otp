import axios, { AxiosError } from 'axios';
import { BaseWhatsAppProvider } from './WhatsAppProvider';
import { WhatsAppMessage, WhatsAppSendResult } from '../types';
import { logger } from '../utils/logger';

export class TwilioWhatsAppProvider extends BaseWhatsAppProvider {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;
  private readonly baseUrl: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  }

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    try {
      const formattedPhoneNumber = this.formatPhoneNumber(message.to);

      const payload = new URLSearchParams({
        From: `whatsapp:${this.fromNumber}`,
        To: `whatsapp:+${formattedPhoneNumber}`,
        Body: message.message,
      });

      logger.info(
        {
          provider: 'twilio',
          to: this.maskPhoneNumber(message.to),
        },
        'Sending WhatsApp message via Twilio API'
      );

      const response = await axios.post(this.baseUrl, payload, {
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

      logger.info(
        {
          provider: 'twilio',
          messageId,
          to: this.maskPhoneNumber(message.to),
        },
        'WhatsApp message sent successfully'
      );

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      logger.error(
        {
          provider: 'twilio',
          to: this.maskPhoneNumber(message.to),
          error: error instanceof AxiosError ? error.response?.data : error,
        },
        'Failed to send WhatsApp message via Twilio API'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getName(): string {
    return 'twilio';
  }

  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) return '****';
    return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
  }
}
