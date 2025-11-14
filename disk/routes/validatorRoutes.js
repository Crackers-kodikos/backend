"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validatorController_js_1 = require("../controllers/validatorController.js");
const authMiddlewares_js_1 = require("../middleware/authMiddlewares.js");
const router = express_1.default.Router();
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
router.get('/profile', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.getValidatorProfile);
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
router.put('/profile', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.updateValidatorProfile);
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
router.get('/dashboard', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.getValidatorDashboard);
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
router.get('/tailors', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.getAvailableTailors);
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
router.get('/tailors/:tailorId/workload', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.getTailorWorkload);
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
router.post('/items/:itemId/assign', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.assignItemToTailor);
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
router.get('/assignments', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.getValidatorAssignments);
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
router.post('/items/:itemId/review', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.reviewCompletedItem);
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
router.get('/statistics', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isValidator, validatorController_js_1.getValidatorStatistics);
exports.default = router;
