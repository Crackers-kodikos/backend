import express from 'express';
import {
  getOrderItems,
  getOrderItemDetails,
  getOrderItemsByOrder,
  getOrderItemsByTailor,
  updateItemStatus,
  updateMultipleItemsStatus,
  getItemAssignmentDetails,
  getOrderItemStatistics,
  getGlobalItemStatistics
} from '../controllers/orderItemController.js';
import { authenticateToken } from '../middleware/authMiddlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OrderItems
 *   description: Order Item Management & Tracking
 */

// ============== RETRIEVAL ==============

/**
 * @swagger
 * /api/order-items:
 *   get:
 *     summary: Get all order items with filters
 *     tags: [OrderItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: tailorId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of order items
 */
router.get('/', authenticateToken, getOrderItems);

/**
 * @swagger
 * /api/order-items/{itemId}:
 *   get:
 *     summary: Get specific order item details
 *     tags: [OrderItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order item with related data
 */
router.get('/:itemId', authenticateToken, getOrderItemDetails);

/**
 * @swagger
 * /api/order-items/order/{orderId}:
 *   get:
 *     summary: Get all items in an order
 *     tags: [OrderItems]
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
 *         description: Order items with statistics
 */
router.get('/order/:orderId', authenticateToken, getOrderItemsByOrder);

/**
 * @swagger
 * /api/order-items/tailor/{tailorId}:
 *   get:
 *     summary: Get all items assigned to tailor
 *     tags: [OrderItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tailorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tailor's assigned items
 */
router.get('/tailor/:tailorId', authenticateToken, getOrderItemsByTailor);

// ============== STATUS MANAGEMENT ==============

/**
 * @swagger
 * /api/order-items/{itemId}/status:
 *   put:
 *     summary: Update item status
 *     tags: [OrderItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               completionDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item status updated
 */
router.put('/:itemId/status', authenticateToken, updateItemStatus);

/**
 * @swagger
 * /api/order-items/batch/status:
 *   put:
 *     summary: Update multiple items status
 *     tags: [OrderItems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemIds
 *               - newStatus
 *             properties:
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               newStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Multiple items updated
 */
router.put('/batch/status', authenticateToken, updateMultipleItemsStatus);

// ============== ASSIGNMENT ==============

/**
 * @swagger
 * /api/order-items/{itemId}/assignment:
 *   get:
 *     summary: Get item assignment details
 *     tags: [OrderItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment details with tailor and validator
 */
router.get('/:itemId/assignment', authenticateToken, getItemAssignmentDetails);

// ============== STATISTICS ==============

/**
 * @swagger
 * /api/order-items/order/{orderId}/statistics:
 *   get:
 *     summary: Get statistics for order items
 *     tags: [OrderItems]
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
 *         description: Order item statistics
 */
router.get('/order/:orderId/statistics', authenticateToken, getOrderItemStatistics);

/**
 * @swagger
 * /api/order-items/statistics/global:
 *   get:
 *     summary: Get global order item statistics
 *     tags: [OrderItems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global statistics across all items
 */
router.get('/statistics/global', authenticateToken, getGlobalItemStatistics);

export default router;
