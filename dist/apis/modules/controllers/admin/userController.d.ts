import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        user_id: number;
    };
}
export declare const getUsers: (req: Request, res: Response) => Promise<void>;
export declare const getUser: (req: Request, res: Response) => Promise<void>;
export declare const approveUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const banUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const unbanUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const verifyUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUserGroup: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=userController.d.ts.map