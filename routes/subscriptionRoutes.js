import express from 'express';
import {
  getAvailablePlans,
  getPlanDetails,
  subscribeToPlan,
  getCurrentSubscription,
  cancelSubscription,
  upgradePlan,
  getSubscriptionHistory,
  getBillingInfo
} from '../controllers/subscriptionController.js';
import { authenticateToken, isWorkshopOwner } from '../middleware/authMiddlewares.js';

const router = express.Router();

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
router.get('/plans', getAvailablePlans);

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
router.get('/plans/:planId', getPlanDetails);

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
router.post('/subscribe', authenticateToken, isWorkshopOwner, subscribeToPlan);

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
router.get('/current', authenticateToken, isWorkshopOwner, getCurrentSubscription);

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
router.post('/cancel', authenticateToken, isWorkshopOwner, cancelSubscription);

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
router.post('/upgrade', authenticateToken, isWorkshopOwner, upgradePlan);

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
router.get('/history', authenticateToken, isWorkshopOwner, getSubscriptionHistory);

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
router.get('/billing', authenticateToken, isWorkshopOwner, getBillingInfo);

export default router;
