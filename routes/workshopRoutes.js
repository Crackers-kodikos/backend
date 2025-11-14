import express from 'express';
import {
  getWorkshopProfile,
  updateWorkshopProfile,
  getWorkshopDashboard,
  getWorkshopTailors,
  getTailorDetails,
  updateTailorDetails,
  getWorkshopValidators,
  getValidatorDetails,
  updateValidatorDetails,
  getWorkshopMagazines,
  getWorkshopStatistics
} from '../controllers/workshopController.js';
import { authenticateToken, isWorkshopOwner } from '../middleware/authMiddlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Workshop
 *   description: Workshop Management (Workshop Owner Only)
 */

// ============== WORKSHOP PROFILE ==============

/**
 * @swagger
 * /api/workshop/profile:
 *   get:
 *     summary: Get workshop profile
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workshop profile retrieved
 *       404:
 *         description: Workshop not found
 */
router.get('/profile', authenticateToken, isWorkshopOwner, getWorkshopProfile);

/**
 * @swagger
 * /api/workshop/profile:
 *   put:
 *     summary: Update workshop profile
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               commissionPercentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Workshop profile updated
 */
router.put('/profile', authenticateToken, isWorkshopOwner, updateWorkshopProfile);

// ============== WORKSHOP DASHBOARD ==============

/**
 * @swagger
 * /api/workshop/dashboard:
 *   get:
 *     summary: Get workshop dashboard overview
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data with stats and recent orders
 */
router.get('/dashboard', authenticateToken, isWorkshopOwner, getWorkshopDashboard);

// ============== TAILOR MANAGEMENT ==============

/**
 * @swagger
 * /api/workshop/tailors:
 *   get:
 *     summary: Get all tailors in workshop
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, busy, unavailable]
 *     responses:
 *       200:
 *         description: List of tailors
 */
router.get('/tailors', authenticateToken, isWorkshopOwner, getWorkshopTailors);

/**
 * @swagger
 * /api/workshop/tailors/{tailorId}:
 *   get:
 *     summary: Get tailor details
 *     tags: [Workshop]
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
 *         description: Tailor details
 *       404:
 *         description: Tailor not found
 */
router.get('/tailors/:tailorId', authenticateToken, isWorkshopOwner, getTailorDetails);

/**
 * @swagger
 * /api/workshop/tailors/{tailorId}:
 *   put:
 *     summary: Update tailor details
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tailorId
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
 *               skills:
 *                 type: string
 *               availabilityStatus:
 *                 type: string
 *                 enum: [available, busy, unavailable]
 *     responses:
 *       200:
 *         description: Tailor updated
 */
router.put('/tailors/:tailorId', authenticateToken, isWorkshopOwner, updateTailorDetails);

// ============== VALIDATOR MANAGEMENT ==============

/**
 * @swagger
 * /api/workshop/validators:
 *   get:
 *     summary: Get all validators in workshop
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of validators
 */
router.get('/validators', authenticateToken, isWorkshopOwner, getWorkshopValidators);

/**
 * @swagger
 * /api/workshop/validators/{validatorId}:
 *   get:
 *     summary: Get validator details
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: validatorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Validator details
 *       404:
 *         description: Validator not found
 */
router.get('/validators/:validatorId', authenticateToken, isWorkshopOwner, getValidatorDetails);

/**
 * @swagger
 * /api/workshop/validators/{validatorId}:
 *   put:
 *     summary: Update validator details
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: validatorId
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
 *               fullName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validator updated
 */
router.put('/validators/:validatorId', authenticateToken, isWorkshopOwner, updateValidatorDetails);

// ============== MAGAZINE MANAGEMENT ==============

/**
 * @swagger
 * /api/workshop/magazines:
 *   get:
 *     summary: Get all magazines connected to workshop
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of magazines
 */
router.get('/magazines', authenticateToken, isWorkshopOwner, getWorkshopMagazines);

// ============== STATISTICS ==============

/**
 * @swagger
 * /api/workshop/statistics:
 *   get:
 *     summary: Get detailed workshop statistics
 *     tags: [Workshop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workshop statistics
 */
router.get('/statistics', authenticateToken, isWorkshopOwner, getWorkshopStatistics);

export default router;
