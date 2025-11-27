import express, { Router } from 'express';
import * as dashboardController from '../../controllers/admin/dashboardController';
import { adminAuth } from '../../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/', adminAuth, dashboardController.getDashboard);

export default router;

