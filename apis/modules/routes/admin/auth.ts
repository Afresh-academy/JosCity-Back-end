import express, { Router } from "express";
import * as authController from "../../controllers/authController";
import { verifyToken, adminAuth } from "../../middleware/authMiddleware";

const router: Router = express.Router();

// Admin login - no authentication required (public endpoint)
router.post("/login", authController.adminLogin);

// Admin auth routes - these are admin-only operations (require authentication)
router.get("/pending", verifyToken, adminAuth, authController.getPendingApprovals);
router.post("/approve", verifyToken, adminAuth, authController.approveAccount);
router.post("/reject", verifyToken, adminAuth, authController.rejectAccount);

export default router;
