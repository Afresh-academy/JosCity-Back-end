import express, { Router } from 'express';
import * as dataController from '../../controllers/admin/dataController';
import { verifyToken, adminAuth } from '../../middleware/authMiddleware';

const router: Router = express.Router();

// All data routes require admin authentication
router.get('/stats', verifyToken, adminAuth, dataController.getDatabaseStats);
router.get('/users', verifyToken, adminAuth, dataController.getAllUsers);
router.get('/tables', verifyToken, adminAuth, dataController.getDatabaseTables);
router.get('/tables/:table_name/schema', verifyToken, adminAuth, dataController.getTableSchema);
router.get('/tables/:table_name/data', verifyToken, adminAuth, dataController.getTableData);
router.post('/query', verifyToken, adminAuth, dataController.executeQuery);

export default router;

