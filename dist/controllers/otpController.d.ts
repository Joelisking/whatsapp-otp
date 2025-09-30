import { Request, Response } from 'express';
import { OTPService } from '../services/OTPService';
import { WhatsAppProvider } from '../types';
export declare class OTPController {
    private readonly otpService;
    private readonly whatsappProvider;
    constructor(otpService: OTPService, whatsappProvider: WhatsAppProvider);
    requestOTP(req: Request, res: Response): Promise<void>;
    verifyOTP(req: Request, res: Response): Promise<void>;
    private createOTPMessage;
}
//# sourceMappingURL=otpController.d.ts.map