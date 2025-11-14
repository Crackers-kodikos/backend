"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authControllers_js_1 = require("../controllers/authControllers.js");
const authMiddlewares_js_1 = require("../middleware/authMiddlewares.js");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and User Management
 */
/**
 * @swagger
 * /api/auth/register/workshop:
 *   post:
 *     summary: Register a new workshop owner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - firstname
 *               - lastname
 *               - workshopName
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               workshopName:
 *                 type: string
 *               workshopDescription:
 *                 type: string
 *               workshopAddress:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workshop created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/register/workshop', authControllers_js_1.registerWorkshopOwner);
/**
 * @swagger
 * /api/auth/register/user:
 *   post:
 *     summary: Register a new user with referral
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - firstname
 *               - lastname
 *               - userType
 *               - referralCode
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [MAGAZINE_OWNER, TAILOR, VALIDATOR]
 *               referralCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/register/user', authControllers_js_1.registerUserWithReferral);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authControllers_js_1.loginUser);
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get('/profile', authMiddlewares_js_1.authenticateToken, authControllers_js_1.getUserProfile);
/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', authMiddlewares_js_1.authenticateToken, authControllers_js_1.updateUserProfile);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authMiddlewares_js_1.authenticateToken, authControllers_js_1.logoutUser);
/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     summary: Check if user is authenticated
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User authenticated
 */
router.get('/check', authMiddlewares_js_1.authenticateToken, authControllers_js_1.checkAuth);
/**
 * @swagger
 * /api/auth/referral-link:
 *   post:
 *     summary: Generate new referral link (Workshop Owner only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referralType
 *             properties:
 *               referralType:
 *                 type: string
 *                 enum: [MAGAZINE, TAILOR, VALIDATOR]
 *     responses:
 *       201:
 *         description: Referral link created
 */
router.post('/referral-link', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, authControllers_js_1.getReferralLink);
/**
 * @swagger
 * /api/auth/referral-links:
 *   get:
 *     summary: Get all referral links (Workshop Owner only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of referral links
 */
router.get('/referral-links', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isWorkshopOwner, authControllers_js_1.getAllReferralLinks);
exports.default = router;
