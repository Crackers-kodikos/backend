import express from 'express';
import {
  getTailorProfile,
  updateTailorProfile,
  getTailorDashboard,
  getAssignedTasks,
  getTaskDetails,
  updateTaskStatus,
  getTailorStatistics
} from '../controllers/tailorController.js';
import { authenticateToken, isTailor } from '../middleware/authMiddlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tailor
 *   description: Tailor Operations & Task Management
 */

router.get('/profile', authenticateToken, isTailor, getTailorProfile);

router.put('/profile', authenticateToken, isTailor, updateTailorProfile);

router.get('/dashboard', authenticateToken, isTailor, getTailorDashboard);

router.get('/tasks', authenticateToken, isTailor, getAssignedTasks);

router.get('/tasks/:itemId', authenticateToken, isTailor, getTaskDetails);

router.put('/tasks/:itemId/status', authenticateToken, isTailor, updateTaskStatus);

router.get('/statistics', authenticateToken, isTailor, getTailorStatistics);

export default router;
