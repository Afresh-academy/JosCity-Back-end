import { Request, Response } from 'express';
interface SignUpBody {
    first_name: string;
    last_name: string;
    gender: string;
    phone_number: string;
    nin_number?: string;
    email: string;
    password: string;
    address: string;
    account_type?: 'personal' | 'business';
    business_name?: string;
    business_type?: string;
    CAC_number?: string;
    business_location?: string;
}
/**
 * User Registration - Submit for Review (Personal or Business)
 */
export declare const signUp: (req: Request<{}, {}, SignUpBody>, res: Response) => Promise<void>;
/**
 * Get Pending Approvals (For Admin) - Updated for both account types
 */
export declare const getPendingApprovals: (_req: Request, res: Response) => Promise<void>;
/**
 * Admin Approve Account - Updated for both account types
 */
export declare const approveAccount: (req: Request, res: Response) => Promise<void>;
/**
 * Admin Reject Account - Updated for both account types
 */
export declare const rejectAccount: (req: Request, res: Response) => Promise<void>;
/**
 * User Login (After Approval) - Updated for both account types
 */
export declare const signIn: (req: Request, res: Response) => Promise<void>;
/**
 * Forgot Password - Request reset
 */
export declare const forgetPassword: (req: Request, res: Response) => Promise<void>;
/**
 * Confirm Reset Code
 */
export declare const forgetPasswordConfirm: (req: Request, res: Response) => Promise<void>;
/**
 * Reset Password with new password
 */
export declare const forgetPasswordReset: (req: Request, res: Response) => Promise<void>;
/**
 * Resend Activation Code
 */
export declare const resendActivation: (req: Request, res: Response) => Promise<void>;
/**
 * User Logout
 */
export declare const signOut: (_req: Request, res: Response) => Promise<void>;
/**
 * Admin Login - Bypasses activation code requirement
 * Only allows login for users with user_group = 1 (admin) or user_group = 2 (moderator)
 */
export declare const adminLogin: (req: Request, res: Response) => Promise<void>;
/**
 * Admin Authentication - Hardcoded credentials for admin access
 * Route: /api/admin/adminAuth
 */
export declare const adminAuth: (req: Request, res: Response) => Promise<void>;
/**
 * Personal Registration - Wrapper for signUp with account_type='personal'
 */
export declare const personalRegister: (req: Request<{}, {}, SignUpBody>, res: Response) => Promise<void>;
/**
 * Business Registration - Wrapper for signUp with account_type='business'
 */
export declare const businessRegister: (req: Request<{}, {}, SignUpBody>, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=authController.d.ts.map