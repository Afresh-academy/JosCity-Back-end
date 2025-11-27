import express, { Router } from 'express';
import * as userController from '../../controllers/admin/userController';
import { verifyToken, adminAuth } from '../../middleware/authMiddleware';

const router: Router = express.Router();

// All routes require authentication and admin privileges
router.get('/', verifyToken, adminAuth, userController.getUsers);
router.get('/:id', verifyToken, adminAuth, userController.getUser);
router.post('/:id/approve', verifyToken, adminAuth, userController.approveUser);
router.post('/:id/ban', verifyToken, adminAuth, userController.banUser);
router.post('/:id/unban', verifyToken, adminAuth, userController.unbanUser);
router.post('/:id/verify', verifyToken, adminAuth, userController.verifyUser);
router.put('/:id/group', verifyToken, adminAuth, userController.updateUserGroup);
router.delete('/:id', verifyToken, adminAuth, userController.deleteUser);

export default router;

