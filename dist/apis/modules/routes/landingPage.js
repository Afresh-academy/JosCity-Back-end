"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const landingPageController = __importStar(require("../controllers/admin/landingPageController"));
const router = express_1.default.Router();
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
router.get("/pricing/plans/:planId/features", landingPageController.getPricingPlanFeatures);
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
router.get("/stats/registered-citizens", landingPageController.getRegisteredCitizensCount);
exports.default = router;
//# sourceMappingURL=landingPage.js.map