import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        user_id: number;
    };
}
export declare const getPosts: (req: Request, res: Response) => Promise<void>;
export declare const approvePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deletePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPost: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=postController.d.ts.map