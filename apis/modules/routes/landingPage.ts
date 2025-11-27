import express, { Router } from "express";
import * as landingPageController from "../controllers/admin/landingPageController";

const router: Router = express.Router();

// Public routes for landing page (no authentication required)
// Navbar routes
router.get("/navbar/menu-items", landingPageController.getNavbarMenuItems);
router.get("/navbar/settings", landingPageController.getNavbarSettings);

// Contact routes
router.get("/contact/settings", landingPageController.getContactSettings);
router.get("/contact/information", landingPageController.getContactInformation);

// Events routes
router.get("/events/settings", landingPageController.getEventsSettings);
router.get("/events", landingPageController.getEvents);
router.get("/events/:id", landingPageController.getEvent);

// Services routes
router.get("/services/settings", landingPageController.getServicesSettings);
router.get("/services", landingPageController.getServices);
router.get("/services/:id", landingPageController.getService);

// Pricing routes
router.get("/pricing/settings", landingPageController.getPricingSettings);
router.get("/pricing/plans", landingPageController.getPricingPlans);
router.get("/pricing/plans/:id", landingPageController.getPricingPlan);
router.get(
  "/pricing/plans/:planId/features",
  landingPageController.getPricingPlanFeatures
);

// Guidelines routes
router.get("/guidelines/settings", landingPageController.getGuidelinesSettings);
router.get("/guidelines", landingPageController.getGuidelines);
router.get("/guidelines/:id", landingPageController.getGuideline);

// Hero routes
router.get("/hero/settings", landingPageController.getHeroSettings);
router.get("/hero/slides", landingPageController.getHeroSlides);
router.get("/hero/slides/:id", landingPageController.getHeroSlide);

// Footer routes
router.get("/footer/settings", landingPageController.getFooterSettings);
router.get("/footer/links", landingPageController.getFooterLinks);

// Stats routes
router.get(
  "/stats/registered-citizens",
  landingPageController.getRegisteredCitizensCount
);

export default router;
