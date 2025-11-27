import express, { Router } from 'express';
import * as landingPageController from '../../controllers/admin/landingPageController';
import { adminAuth, verifyToken } from '../../middleware/authMiddleware';

const router: Router = express.Router();

// Navbar routes
router.get('/navbar/menu-items', verifyToken, adminAuth, landingPageController.getNavbarMenuItems);
router.post('/navbar/menu-items', verifyToken, adminAuth, landingPageController.createNavbarMenuItem);
router.put('/navbar/menu-items/:id', verifyToken, adminAuth, landingPageController.updateNavbarMenuItem);
router.delete('/navbar/menu-items/:id', verifyToken, adminAuth, landingPageController.deleteNavbarMenuItem);
router.get('/navbar/settings', verifyToken, adminAuth, landingPageController.getNavbarSettings);
router.put('/navbar/settings', verifyToken, adminAuth, landingPageController.updateNavbarSettings);

// Contact routes
router.get('/contact/settings', verifyToken, adminAuth, landingPageController.getContactSettings);
router.put('/contact/settings', verifyToken, adminAuth, landingPageController.updateContactSettings);
router.get('/contact/messages', verifyToken, adminAuth, landingPageController.getContactMessages);
router.get('/contact/messages/:id', verifyToken, adminAuth, landingPageController.getContactMessage);
router.put('/contact/messages/:id', verifyToken, adminAuth, landingPageController.updateContactMessage);
router.delete('/contact/messages/:id', verifyToken, adminAuth, landingPageController.deleteContactMessage);
router.get('/contact/information', verifyToken, adminAuth, landingPageController.getContactInformation);
router.post('/contact/information', verifyToken, adminAuth, landingPageController.createContactInformation);
router.put('/contact/information/:id', verifyToken, adminAuth, landingPageController.updateContactInformation);
router.delete('/contact/information/:id', verifyToken, adminAuth, landingPageController.deleteContactInformation);

// Events routes
router.get('/events/settings', verifyToken, adminAuth, landingPageController.getEventsSettings);
router.put('/events/settings', verifyToken, adminAuth, landingPageController.updateEventsSettings);
router.get('/events', verifyToken, adminAuth, landingPageController.getEvents);
router.get('/events/:id', verifyToken, adminAuth, landingPageController.getEvent);
router.post('/events', verifyToken, adminAuth, landingPageController.createEvent);
router.put('/events/:id', verifyToken, adminAuth, landingPageController.updateEvent);
router.delete('/events/:id', verifyToken, adminAuth, landingPageController.deleteEvent);
router.get('/events/:eventId/registrations', verifyToken, adminAuth, landingPageController.getEventRegistrations);
router.put('/event-registrations/:id', verifyToken, adminAuth, landingPageController.updateEventRegistration);
router.get('/event-registrations', verifyToken, adminAuth, landingPageController.getEventRegistrations);

// Services routes
router.get('/services/settings', verifyToken, adminAuth, landingPageController.getServicesSettings);
router.put('/services/settings', verifyToken, adminAuth, landingPageController.updateServicesSettings);
router.get('/services', verifyToken, adminAuth, landingPageController.getServices);
router.get('/services/:id', verifyToken, adminAuth, landingPageController.getService);
router.post('/services', verifyToken, adminAuth, landingPageController.createService);
router.put('/services/:id', verifyToken, adminAuth, landingPageController.updateService);
router.delete('/services/:id', verifyToken, adminAuth, landingPageController.deleteService);
router.get('/service-requests', verifyToken, adminAuth, landingPageController.getServiceRequests);
router.put('/service-requests/:id', verifyToken, adminAuth, landingPageController.updateServiceRequest);

// Pricing routes
router.get('/pricing/settings', verifyToken, adminAuth, landingPageController.getPricingSettings);
router.put('/pricing/settings', verifyToken, adminAuth, landingPageController.updatePricingSettings);
router.get('/pricing/plans', verifyToken, adminAuth, landingPageController.getPricingPlans);
router.get('/pricing/plans/:id', verifyToken, adminAuth, landingPageController.getPricingPlan);
router.post('/pricing/plans', verifyToken, adminAuth, landingPageController.createPricingPlan);
router.put('/pricing/plans/:id', verifyToken, adminAuth, landingPageController.updatePricingPlan);
router.delete('/pricing/plans/:id', verifyToken, adminAuth, landingPageController.deletePricingPlan);
router.get('/pricing/plans/:planId/features', verifyToken, adminAuth, landingPageController.getPricingPlanFeatures);
router.post('/pricing/plan-features', verifyToken, adminAuth, landingPageController.createPricingPlanFeature);
router.put('/pricing/plan-features/:id', verifyToken, adminAuth, landingPageController.updatePricingPlanFeature);
router.delete('/pricing/plan-features/:id', verifyToken, adminAuth, landingPageController.deletePricingPlanFeature);
router.get('/pricing/subscriptions', verifyToken, adminAuth, landingPageController.getUserSubscriptions);
router.put('/pricing/subscriptions/:id', verifyToken, adminAuth, landingPageController.updateUserSubscription);

// Guidelines routes
router.get('/guidelines/settings', verifyToken, adminAuth, landingPageController.getGuidelinesSettings);
router.put('/guidelines/settings', verifyToken, adminAuth, landingPageController.updateGuidelinesSettings);
router.get('/guidelines', verifyToken, adminAuth, landingPageController.getGuidelines);
router.get('/guidelines/:id', verifyToken, adminAuth, landingPageController.getGuideline);
router.post('/guidelines', verifyToken, adminAuth, landingPageController.createGuideline);
router.put('/guidelines/:id', verifyToken, adminAuth, landingPageController.updateGuideline);
router.delete('/guidelines/:id', verifyToken, adminAuth, landingPageController.deleteGuideline);

// Hero routes
router.get('/hero/settings', verifyToken, adminAuth, landingPageController.getHeroSettings);
router.put('/hero/settings', verifyToken, adminAuth, landingPageController.updateHeroSettings);
router.get('/hero/slides', verifyToken, adminAuth, landingPageController.getHeroSlides);
router.get('/hero/slides/:id', verifyToken, adminAuth, landingPageController.getHeroSlide);
router.post('/hero/slides', verifyToken, adminAuth, landingPageController.createHeroSlide);
router.put('/hero/slides/:id', verifyToken, adminAuth, landingPageController.updateHeroSlide);
router.delete('/hero/slides/:id', verifyToken, adminAuth, landingPageController.deleteHeroSlide);

// Footer routes
router.get('/footer/settings', verifyToken, adminAuth, landingPageController.getFooterSettings);
router.put('/footer/settings', verifyToken, adminAuth, landingPageController.updateFooterSettings);
router.get('/footer/links', verifyToken, adminAuth, landingPageController.getFooterLinks);
router.post('/footer/links', verifyToken, adminAuth, landingPageController.createFooterLink);
router.put('/footer/links/:id', verifyToken, adminAuth, landingPageController.updateFooterLink);
router.delete('/footer/links/:id', verifyToken, adminAuth, landingPageController.deleteFooterLink);

export default router;

