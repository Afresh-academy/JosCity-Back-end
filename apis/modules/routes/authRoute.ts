import express, { Router } from 'express';
import * as authController from '../controllers/authController';

const router: Router = express.Router();

// Public routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);

// Registration routes (wrappers for signup with account_type)
router.post('/personal/register', authController.personalRegister);
router.post('/business/register', authController.businessRegister);

// Password reset routes
router.post('/forget_password', authController.forgetPassword);
router.post('/forget_password_confirm', authController.forgetPasswordConfirm);
router.post('/forget_password_reset', authController.forgetPasswordReset);

// Activation routes
router.post('/resend_activation', authController.resendActivation);

// Admin routes
router.get('/admin/pending', authController.getPendingApprovals);
router.post('/admin/approve', authController.approveAccount);
router.post('/admin/reject', authController.rejectAccount);

export default router;

