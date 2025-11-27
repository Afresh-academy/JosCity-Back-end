import express, { Router } from 'express';
import * as postController from '../../controllers/admin/postController';
import { adminAuth } from '../../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/', adminAuth, postController.getPosts);
router.get('/:id', adminAuth, postController.getPost);
router.post('/:id/approve', adminAuth, postController.approvePost);
router.delete('/:id', adminAuth, postController.deletePost);

export default router;

