"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workshopController_js_1 = require("../controllers/workshopController.js");
const authMiddlewares_js_1 = require("../middleware/authMiddlewares.js");
const router = express_1.default.Router();
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
router.get('/profile', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.getWorkshopProfile);
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
router.put('/profile', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.updateWorkshopProfile);
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
router.get('/dashboard', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.getWorkshopDashboard);
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
router.get('/tailors', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.getWorkshopTailors);
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
router.get('/tailors/:tailorId', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.getTailorDetails);
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
router.put('/tailors/:tailorId', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.updateTailorDetails);
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
router.get('/validators', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.getWorkshopValidators);
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
router.get('/validators/:validatorId', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.getValidatorDetails);
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
router.put('/validators/:validatorId', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.updateValidatorDetails);
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
router.get('/magazines', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.getWorkshopMagazines);
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
router.get('/statistics', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, workshopController_js_1.getWorkshopStatistics);
exports.default = router;
