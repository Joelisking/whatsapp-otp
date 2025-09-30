import axios, { AxiosError } from 'axios';
import { BaseWhatsAppProvider } from './WhatsAppProvider';
import { WhatsAppMessage, WhatsAppSendResult } from '../types';
import { logger } from '../utils/logger';

export class MetaWhatsAppProvider extends BaseWhatsAppProvider {
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly apiVersion: string;
  private readonly baseUrl: string;

  constructor(accessToken: string, phoneNumberId: string, apiVersion = 'v18.0') {
    super();
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.apiVersion = apiVersion;
    this.baseUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  }

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    try {
      const formattedPhoneNumber = this.formatPhoneNumber(message.to);

      const payload = {
        messaging_product: 'whatsapp',
        to: formattedPhoneNumber,
        type: 'template',
        template: {
          name: 'otp_verification',
          language: {
            code: 'en_US'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: message.otpCode || '123456'
                }
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [
                {
                  type: 'text',
                  text: message.otpCode || '123456'
                }
              ]
            }
          ]
        }
      };

      logger.info(
        {
          provider: 'meta',
          to: this.maskPhoneNumber(message.to),
        },
        'Sending WhatsApp message via Meta API'
      );

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const messageId = response.data?.messages?.[0]?.id;

      logger.info(
        {
          provider: 'meta',
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
          provider: 'meta',
          to: this.maskPhoneNumber(message.to),
          error: error instanceof AxiosError ? error.response?.data : error,
        },
        'Failed to send WhatsApp message via Meta API'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getName(): string {
    return 'meta';
  }

  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) return '****';
    return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
  }
}
