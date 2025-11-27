import express, { Router } from "express";

// Import admin route modules
import authRoutes from "./auth";
import dashboardRoutes from "./dashboard";
import usersRoutes from "./users";
import postsRoutes from "./posts";
import settingsRoutes from "./settings";
import landingPageRoutes from "./landingPage";
import dataRoutes from "./data";

const router: Router = express.Router();

// Mount admin routes
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", usersRoutes);
router.use("/posts", postsRoutes);
router.use("/settings", settingsRoutes);
router.use("/landing-page", landingPageRoutes);
router.use("/data", dataRoutes);

export default router;
