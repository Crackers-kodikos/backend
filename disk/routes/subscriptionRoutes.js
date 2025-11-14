"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptionController_js_1 = require("../controllers/subscriptionController.js");
const authMiddlewares_js_1 = require("../middleware/authMiddlewares.js");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription & Billing Management (MOCK PAYMENT)
 */
// ============== PLANS ==============
/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Get available subscription plans
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of available plans
 */
router.get('/plans', subscriptionController_js_1.getAvailablePlans);
/**
 * @swagger
 * /api/subscriptions/plans/{planId}:
 *   get:
 *     summary: Get plan details
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan details with benefits
 */
router.get('/plans/:planId', subscriptionController_js_1.getPlanDetails);
// ============== SUBSCRIPTION MANAGEMENT ==============
/**
 * @swagger
 * /api/subscriptions/subscribe:
 *   post:
 *     summary: Subscribe to a plan (MOCK PAYMENT)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - paymentMethodToken
 *             properties:
 *               planId:
 *                 type: string
 *               paymentMethodToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription created with mock payment
 */
router.post('/subscribe', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, subscriptionController_js_1.subscribeToPlan);
/**
 * @swagger
 * /api/subscriptions/current:
 *   get:
 *     summary: Get current active subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription details
 */
router.get('/current', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, subscriptionController_js_1.getCurrentSubscription);
/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
router.post('/cancel', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, subscriptionController_js_1.cancelSubscription);
/**
 * @swagger
 * /api/subscriptions/upgrade:
 *   post:
 *     summary: Upgrade to different plan (MOCK PAYMENT)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPlanId
 *               - paymentMethodToken
 *             properties:
 *               newPlanId:
 *                 type: string
 *               paymentMethodToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan upgraded with mock payment
 */
router.post('/upgrade', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, subscriptionController_js_1.upgradePlan);
// ============== HISTORY & BILLING ==============
/**
 * @swagger
 * /api/subscriptions/history:
 *   get:
 *     summary: Get subscription history
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription history
 */
router.get('/history', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, subscriptionController_js_1.getSubscriptionHistory);
/**
 * @swagger
 * /api/subscriptions/billing:
 *   get:
 *     summary: Get billing information
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Billing and payment information
 */
router.get('/billing', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, subscriptionController_js_1.getBillingInfo);
exports.default = router;
