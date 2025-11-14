import express from 'express';
import {
  getOrderTrackingHistory,
  getMagazineOrdersTracking,
  getRecentTrackingEvents,
  getOrderStatusSummary,
  getMagazineTrackingDashboard,
  getTrackingStatisticsByStatus,
  getAverageProcessingTime,
  exportOrderTrackingReport
} from '../controllers/trackingController.js';
import { authenticateToken, isMagazineOwner } from '../middleware/authMiddlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tracking
 *   description: Order Tracking & Status Monitoring
 */

// ============== ORDER TRACKING ==============

/**
 * @swagger
 * /api/tracking/order/{orderId}:
 *   get:
 *     summary: Get order tracking history
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order tracking history
 */
router.get('/order/:orderId', authenticateToken, getOrderTrackingHistory);

/**
 * @swagger
 * /api/tracking/order/{orderId}/summary:
 *   get:
 *     summary: Get order status summary
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order status summary
 */
router.get('/order/:orderId/summary', authenticateToken, getOrderStatusSummary);

// ============== MAGAZINE TRACKING ==============

/**
 * @swagger
 * /api/tracking/magazine/orders:
 *   get:
 *     summary: Get magazine orders tracking
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Magazine orders with tracking
 */
router.get('/magazine/orders', authenticateToken, isMagazineOwner, getMagazineOrdersTracking);

/**
 * @swagger
 * /api/tracking/magazine/dashboard:
 *   get:
 *     summary: Get magazine tracking dashboard
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Magazine tracking dashboard
 */
router.get('/magazine/dashboard', authenticateToken, isMagazineOwner, getMagazineTrackingDashboard);

// ============== RECENT EVENTS ==============

/**
 * @swagger
 * /api/tracking/events/recent:
 *   get:
 *     summary: Get recent tracking events
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent tracking events
 */
router.get('/events/recent', authenticateToken, getRecentTrackingEvents);

// ============== STATISTICS ==============

/**
 * @swagger
 * /api/tracking/statistics/status:
 *   get:
 *     summary: Get tracking statistics by status
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tracking statistics
 */
router.get('/statistics/status', authenticateToken, getTrackingStatisticsByStatus);

/**
 * @swagger
 * /api/tracking/statistics/processing-time:
 *   get:
 *     summary: Get average processing time
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Average processing time
 */
router.get('/statistics/processing-time', authenticateToken, getAverageProcessingTime);

// ============== REPORTS ==============

/**
 * @swagger
 * /api/tracking/report/{orderId}:
 *   get:
 *     summary: Export order tracking report
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tracking report
 */
router.get('/report/:orderId', authenticateToken, exportOrderTrackingReport);

export default router;
