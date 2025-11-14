"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tailorController_js_1 = require("../controllers/tailorController.js");
const authMiddlewares_js_1 = require("../middleware/authMiddlewares.js");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Tailor
 *   description: Tailor Operations & Task Management
 */
router.get('/profile', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isTailor, tailorController_js_1.getTailorProfile);
router.put('/profile', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isTailor, tailorController_js_1.updateTailorProfile);
router.get('/dashboard', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isTailor, tailorController_js_1.getTailorDashboard);
router.get('/tasks', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isTailor, tailorController_js_1.getAssignedTasks);
router.get('/tasks/:itemId', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isTailor, tailorController_js_1.getTaskDetails);
router.put('/tasks/:itemId/status', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isTailor, tailorController_js_1.updateTaskStatus);
router.get('/statistics', authMiddlewares_js_1.authenticateToken, authMiddlewares_js_1.isTailor, tailorController_js_1.getTailorStatistics);
exports.default = router;
