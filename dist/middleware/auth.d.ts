import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    rawBody?: string;
}
export declare function hmacAuth(secret: string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function rawBodyParser(req: AuthenticatedRequest, res: Response, buf: Buffer): void;
export {};
//# sourceMappingURL=auth.d.ts.map