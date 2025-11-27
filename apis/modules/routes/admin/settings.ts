import express, { Router } from 'express';
import * as settingsController from '../../controllers/admin/settingsController';
import { adminAuth } from '../../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/', adminAuth, settingsController.getSettings);
router.put('/', adminAuth, settingsController.updateSettings);
router.get('/registration', adminAuth, settingsController.getRegistrationSettings);
router.put('/registration', adminAuth, settingsController.updateRegistrationSettings);

export default router;

