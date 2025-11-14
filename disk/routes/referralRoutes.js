"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const referralController_js_1 = require("../controllers/referralController.js");
const authMiddlewares_js_1 = require("../middleware/authMiddlewares.js");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Referral Links
 *   description: Referral Link Management for Workshop Owners
 */
/**
 * @swagger
 * /api/referral/magazine:
 *   post:
 *     summary: Generate referral link for Magazine Owner
 *     tags: [Referral Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresInDays:
 *                 type: integer
 *                 description: Number of days before link expires (optional)
 *     responses:
 *       201:
 *         description: Magazine referral link generated successfully
 *       403:
 *         description: Only workshop owners can generate referral links
 */
router.post('/magazine', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, referralController_js_1.generateMagazineReferralLink);
/**
 * @swagger
 * /api/referral/tailor:
 *   post:
 *     summary: Generate referral link for Tailor
 *     tags: [Referral Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresInDays:
 *                 type: integer
 *                 description: Number of days before link expires (optional)
 *     responses:
 *       201:
 *         description: Tailor referral link generated successfully
 *       403:
 *         description: Only workshop owners can generate referral links
 */
router.post('/tailor', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, referralController_js_1.generateTailorReferralLink);
/**
 * @swagger
 * /api/referral/validator:
 *   post:
 *     summary: Generate referral link for Validator
 *     tags: [Referral Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresInDays:
 *                 type: integer
 *                 description: Number of days before link expires (optional)
 *     responses:
 *       201:
 *         description: Validator referral link generated successfully
 *       403:
 *         description: Only workshop owners can generate referral links
 */
router.post('/validator', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, referralController_js_1.generateValidatorReferralLink);
/**
 * @swagger
 * /api/referral/bulk:
 *   post:
 *     summary: Generate multiple referral links at once
 *     tags: [Referral Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - count
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [MAGAZINE, TAILOR, VALIDATOR]
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *               expiresInDays:
 *                 type: integer
 *                 description: Number of days before links expire (optional)
 *     responses:
 *       201:
 *         description: Bulk referral links generated successfully
 *       400:
 *         description: Invalid type or count
 */
router.post('/bulk', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, referralController_js_1.generateBulkReferralLinks);
/**
 * @swagger
 * /api/referral/all:
 *   get:
 *     summary: Get all referral links for workshop
 *     tags: [Referral Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MAGAZINE, TAILOR, VALIDATOR]
 *         description: Filter by type (optional)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status (optional)
 *     responses:
 *       200:
 *         description: Referral links retrieved successfully
 */
router.get('/all', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, referralController_js_1.getAllReferralLinks);
/**
 * @swagger
 * /api/referral/{linkId}/deactivate:
 *   post:
 *     summary: Deactivate a referral link
 *     tags: [Referral Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Referral link deactivated successfully
 *       404:
 *         description: Referral link not found
 */
router.post('/:linkId/deactivate', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, referralController_js_1.deactivateReferralLink);
/**
 * @swagger
 * /api/referral/{linkId}/reactivate:
 *   post:
 *     summary: Reactivate a referral link
 *     tags: [Referral Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: linkId
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
 *               expiresInDays:
 *                 type: integer
 *                 description: Number of days before link expires (optional)
 *     responses:
 *       200:
 *         description: Referral link reactivated successfully
 *       404:
 *         description: Referral link not found
 */
router.post('/:linkId/reactivate', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, referralController_js_1.reactivateReferralLink);
exports.default = router;
