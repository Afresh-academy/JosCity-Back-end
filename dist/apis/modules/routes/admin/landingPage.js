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
const landingPageController = __importStar(require("../../controllers/admin/landingPageController"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
// Navbar routes
router.get('/navbar/menu-items', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getNavbarMenuItems);
router.post('/navbar/menu-items', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createNavbarMenuItem);
router.put('/navbar/menu-items/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateNavbarMenuItem);
router.delete('/navbar/menu-items/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deleteNavbarMenuItem);
router.get('/navbar/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getNavbarSettings);
router.put('/navbar/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateNavbarSettings);
// Contact routes
router.get('/contact/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getContactSettings);
router.put('/contact/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateContactSettings);
router.get('/contact/messages', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getContactMessages);
router.get('/contact/messages/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getContactMessage);
router.put('/contact/messages/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateContactMessage);
router.delete('/contact/messages/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deleteContactMessage);
router.get('/contact/information', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getContactInformation);
router.post('/contact/information', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createContactInformation);
router.put('/contact/information/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateContactInformation);
router.delete('/contact/information/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deleteContactInformation);
// Events routes
router.get('/events/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getEventsSettings);
router.put('/events/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateEventsSettings);
router.get('/events', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getEvents);
router.get('/events/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getEvent);
router.post('/events', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createEvent);
router.put('/events/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateEvent);
router.delete('/events/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deleteEvent);
router.get('/events/:eventId/registrations', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getEventRegistrations);
router.put('/event-registrations/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateEventRegistration);
router.get('/event-registrations', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getEventRegistrations);
// Services routes
router.get('/services/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getServicesSettings);
router.put('/services/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateServicesSettings);
router.get('/services', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getServices);
router.get('/services/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getService);
router.post('/services', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createService);
router.put('/services/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateService);
router.delete('/services/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deleteService);
router.get('/service-requests', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getServiceRequests);
router.put('/service-requests/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateServiceRequest);
// Pricing routes
router.get('/pricing/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getPricingSettings);
router.put('/pricing/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updatePricingSettings);
router.get('/pricing/plans', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getPricingPlans);
router.get('/pricing/plans/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getPricingPlan);
router.post('/pricing/plans', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createPricingPlan);
router.put('/pricing/plans/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updatePricingPlan);
router.delete('/pricing/plans/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deletePricingPlan);
router.get('/pricing/plans/:planId/features', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getPricingPlanFeatures);
router.post('/pricing/plan-features', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createPricingPlanFeature);
router.put('/pricing/plan-features/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updatePricingPlanFeature);
router.delete('/pricing/plan-features/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deletePricingPlanFeature);
router.get('/pricing/subscriptions', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getUserSubscriptions);
router.put('/pricing/subscriptions/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateUserSubscription);
// Guidelines routes
router.get('/guidelines/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getGuidelinesSettings);
router.put('/guidelines/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateGuidelinesSettings);
router.get('/guidelines', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getGuidelines);
router.get('/guidelines/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getGuideline);
router.post('/guidelines', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createGuideline);
router.put('/guidelines/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateGuideline);
router.delete('/guidelines/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deleteGuideline);
// Hero routes
router.get('/hero/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getHeroSettings);
router.put('/hero/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateHeroSettings);
router.get('/hero/slides', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getHeroSlides);
router.get('/hero/slides/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getHeroSlide);
router.post('/hero/slides', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createHeroSlide);
router.put('/hero/slides/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateHeroSlide);
router.delete('/hero/slides/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deleteHeroSlide);
// Footer routes
router.get('/footer/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getFooterSettings);
router.put('/footer/settings', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateFooterSettings);
router.get('/footer/links', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.getFooterLinks);
router.post('/footer/links', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.createFooterLink);
router.put('/footer/links/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.updateFooterLink);
router.delete('/footer/links/:id', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, landingPageController.deleteFooterLink);
exports.default = router;
//# sourceMappingURL=landingPage.js.map