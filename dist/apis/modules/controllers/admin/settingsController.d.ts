import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        user_id: number;
    };
}
export declare const getSettings: (req: Request, res: Response) => Promise<void>;
export declare const updateSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRegistrationSettings: (_req: Request, res: Response) => Promise<void>;
export declare const updateRegistrationSettings: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=settingsController.d.ts.map