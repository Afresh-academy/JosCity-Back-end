import { Request, Response, NextFunction } from 'express';
interface User {
    user_id: number;
    user_group: number;
}
interface AuthRequest extends Request {
    user?: {
        user_id: number;
    };
    admin?: User;
}
export declare const verifyToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const adminAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const superAdminAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map