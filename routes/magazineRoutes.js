import express from 'express';
import {
  getMagazineProfile,
  updateMagazineProfile,
  getMagazineDashboard,
  getAvailableWorkshops,
  createOrder,
  getMagazineOrders,
  getOrderDetails,
  updateOrder,
  cancelOrder
} from '../controllers/magazineController.js';
import { authenticateToken, isMagazineOwner } from '../middleware/authMiddlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Magazine
 *   description: Magazine/Shop Management (Magazine Owner Only)
 */

// ============== PROFILE MANAGEMENT ==============

/**
 * @swagger
 * /api/magazine/profile:
 *   get:
 *     summary: Get magazine/shop profile
 *     tags: [Magazine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Magazine profile and connected workshop
 *       404:
 *         description: Magazine not found
 */
router.get('/profile', authenticateToken, isMagazineOwner, getMagazineProfile);

/**
 * @swagger
 * /api/magazine/profile:
 *   put:
 *     summary: Update magazine/shop profile
 *     tags: [Magazine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopName:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Magazine profile updated
 */
router.put('/profile', authenticateToken, isMagazineOwner, updateMagazineProfile);

// ============== DASHBOARD ==============

/**
 * @swagger
 * /api/magazine/dashboard:
 *   get:
 *     summary: Get magazine dashboard with order statistics
 *     tags: [Magazine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard with stats and recent orders
 */
router.get('/dashboard', authenticateToken, isMagazineOwner, getMagazineDashboard);

// ============== WORKSHOP DISCOVERY ==============

/**
 * @swagger
 * /api/magazine/workshops:
 *   get:
 *     summary: Get available workshops to order from
 *     tags: [Magazine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search workshops by name
 *     responses:
 *       200:
 *         description: List of available workshops
 */
router.get('/workshops', authenticateToken, isMagazineOwner, getAvailableWorkshops);

// ============== ORDER MANAGEMENT ==============

/**
 * @swagger
 * /api/magazine/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Magazine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workshopId
 *               - orderNumber
 *               - totalPrice
 *               - items
 *             properties:
 *               workshopId:
 *                 type: integer
 *               orderNumber:
 *                 type: string
 *               description:
 *                 type: string
 *               estimatedCompletionDate:
 *                 type: string
 *                 format: date-time
 *               totalPrice:
 *                 type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid workshop or missing fields
 */
router.post('/orders', authenticateToken, isMagazineOwner, createOrder);

/**
 * @swagger
 * /api/magazine/orders:
 *   get:
 *     summary: Get all orders for magazine
 *     tags: [Magazine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VALIDATED, TAILORING, PACKAGING, COMPLETED]
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/orders', authenticateToken, isMagazineOwner, getMagazineOrders);

/**
 * @swagger
 * /api/magazine/orders/{orderId}:
 *   get:
 *     summary: Get specific order details with items
 *     tags: [Magazine]
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
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId', authenticateToken, isMagazineOwner, getOrderDetails);

/**
 * @swagger
 * /api/magazine/orders/{orderId}:
 *   put:
 *     summary: Update order (only if PENDING)
 *     tags: [Magazine]
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
 *             properties:
 *               description:
 *                 type: string
 *               estimatedCompletionDate:
 *                 type: string
 *                 format: date-time
 *               totalPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order updated
 *       400:
 *         description: Order not in PENDING status
 */
router.put('/orders/:orderId', authenticateToken, isMagazineOwner, updateOrder);

/**
 * @swagger
 * /api/magazine/orders/{orderId}:
 *   delete:
 *     summary: Cancel order (only if PENDING)
 *     tags: [Magazine]
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
 *         description: Order cancelled
 *       400:
 *         description: Order not in PENDING status
 */
router.delete('/orders/:orderId', authenticateToken, isMagazineOwner, cancelOrder);

export default router;
