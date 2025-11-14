import express from 'express';
import {
  registerWorkshopOwner,
  registerUserWithReferral,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  checkAuth,
  getReferralLink,
  getAllReferralLinks
} from '../controllers/authControllers.js';
import { authenticateToken, isWorkshopOwner } from '../middleware/authMiddlewares.js';

const router = express.Router();

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
router.post('/register/workshop', registerWorkshopOwner);

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
router.post('/register/user', registerUserWithReferral);

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
router.post('/login', loginUser);

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
router.get('/profile', authenticateToken, getUserProfile);

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
router.put('/profile', authenticateToken, updateUserProfile);

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
router.post('/logout', authenticateToken, logoutUser);

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
router.get('/check', authenticateToken, checkAuth);

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
router.post('/referral-link', authenticateToken, isWorkshopOwner, getReferralLink);

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
router.get('/referral-links', authenticateToken, isWorkshopOwner, getAllReferralLinks);

export default router;
