import express from 'express';
import {
  getValidatorProfile,
  updateValidatorProfile,
  getValidatorDashboard,
  getAvailableTailors,
  assignItemToTailor,
  getValidatorAssignments,
  getTailorWorkload,
  reviewCompletedItem,
  getValidatorStatistics
} from '../controllers/validator/validatorController.js';
import { authenticateToken, isValidator } from '../middleware/authMiddlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Validator
 *   description: Validator Operations & Item Assignment
 */

// ============== PROFILE ==============

/**
 * @swagger
 * /api/validator/profile:
 *   get:
 *     summary: Get validator profile
 *     tags: [Validator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Validator profile with workshop
 */
router.get('/profile', authenticateToken, isValidator, getValidatorProfile);

/**
 * @swagger
 * /api/validator/profile:
 *   put:
 *     summary: Update validator profile
 *     tags: [Validator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', authenticateToken, isValidator, updateValidatorProfile);

// ============== DASHBOARD ==============

/**
 * @swagger
 * /api/validator/dashboard:
 *   get:
 *     summary: Get validator dashboard
 *     tags: [Validator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard with pending orders and stats
 */
router.get('/dashboard', authenticateToken, isValidator, getValidatorDashboard);

// ============== TAILOR MANAGEMENT ==============

/**
 * @swagger
 * /api/validator/tailors:
 *   get:
 *     summary: Get available tailors in workshop
 *     tags: [Validator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workshop tailors
 */
router.get('/tailors', authenticateToken, isValidator, getAvailableTailors);

/**
 * @swagger
 * /api/validator/tailors/{tailorId}/workload:
 *   get:
 *     summary: Get tailor workload and assigned items
 *     tags: [Validator]
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
 *         description: Tailor workload details
 */
router.get('/tailors/:tailorId/workload', authenticateToken, isValidator, getTailorWorkload);

// ============== ITEM ASSIGNMENT ==============

/**
 * @swagger
 * /api/validator/items/{itemId}/assign:
 *   post:
 *     summary: Assign item to tailor
 *     tags: [Validator]
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
 *               - tailorId
 *               - estimatedHours
 *             properties:
 *               tailorId:
 *                 type: integer
 *               estimatedHours:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item assigned
 */
router.post('/items/:itemId/assign', authenticateToken, isValidator, assignItemToTailor);

/**
 * @swagger
 * /api/validator/assignments:
 *   get:
 *     summary: Get all assignments made by validator
 *     tags: [Validator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assignments
 */
router.get('/assignments', authenticateToken, isValidator, getValidatorAssignments);

// ============== QUALITY CONTROL ==============

/**
 * @swagger
 * /api/validator/items/{itemId}/review:
 *   post:
 *     summary: Review completed item (approve or send for revision)
 *     tags: [Validator]
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
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item reviewed
 */
router.post('/items/:itemId/review', authenticateToken, isValidator, reviewCompletedItem);

// ============== STATISTICS ==============

/**
 * @swagger
 * /api/validator/statistics:
 *   get:
 *     summary: Get validator statistics
 *     tags: [Validator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Validator performance stats
 */
router.get('/statistics', authenticateToken, isValidator, getValidatorStatistics);

export default router;
