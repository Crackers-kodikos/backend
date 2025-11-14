import express from 'express';
import {
  getWorkshopOrders,
  getOrderWithItems,
  validateOrder,
  rejectOrder,
  updateOrderStatus,
  getOrderStatistics,
  getOrderTimeline
} from '../controllers/order/orderController.js';
import { authenticateToken, isValidator } from '../middleware/authMiddlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order Management (Validator/Workshop Operations)
 */

// ============== GET ORDERS ==============

/**
 * @swagger
 * /api/orders/workshop:
 *   get:
 *     summary: Get all workshop orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VALIDATED, TAILORING, PACKAGING, COMPLETED]
 *       - in: query
 *         name: magazineId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of workshop orders
 */
router.get('/workshop', authenticateToken, isValidator, getWorkshopOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order with full details and items
 *     tags: [Orders]
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
 *         description: Order details with items and tracking
 *       404:
 *         description: Order not found
 */
router.get('/:orderId', authenticateToken, getOrderWithItems);

/**
 * @swagger
 * /api/orders/statistics/overview:
 *   get:
 *     summary: Get order statistics for workshop
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 */
router.get('/statistics/overview', authenticateToken, isValidator, getOrderStatistics);

/**
 * @swagger
 * /api/orders/{orderId}/timeline:
 *   get:
 *     summary: Get order timeline/history
 *     tags: [Orders]
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
 *         description: Order timeline with all status changes
 */
router.get('/:orderId/timeline', authenticateToken, getOrderTimeline);

// ============== VALIDATE/PROCESS ORDERS ==============

/**
 * @swagger
 * /api/orders/{orderId}/validate:
 *   post:
 *     summary: Validate order (PENDING → VALIDATED)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order validated
 *       400:
 *         description: Order not in PENDING status
 */
router.post('/:orderId/validate', authenticateToken, isValidator, validateOrder);

/**
 * @swagger
 * /api/orders/{orderId}/reject:
 *   post:
 *     summary: Reject order with reason
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order rejection logged
 *       400:
 *         description: Order not in PENDING status
 */
router.post('/:orderId/reject', authenticateToken, isValidator, rejectOrder);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update order status (TAILORING → PACKAGING → COMPLETED)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newStatus
 *             properties:
 *               newStatus:
 *                 type: string
 *                 enum: [TAILORING, PACKAGING, COMPLETED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status transition
 */
router.put('/:orderId/status', authenticateToken, isValidator, updateOrderStatus);

export default router;
