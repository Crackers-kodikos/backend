"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTailorStatistics = exports.updateTaskStatus = exports.getTaskDetails = exports.getAssignedTasks = exports.getTailorDashboard = exports.updateTailorProfile = exports.getTailorProfile = void 0;
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// ============== TAILOR PROFILE ==============
const getTailorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, userId))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor profile not found"
            });
        }
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.id, tailor[0].workshopId))
            .limit(1);
        return res.status(200).json({
            success: true,
            message: "Tailor profile retrieved successfully",
            data: {
                tailor: tailor[0],
                workshop: workshop.length > 0 ? workshop[0] : null
            }
        });
    }
    catch (error) {
        console.error("Error retrieving tailor profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tailor profile",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getTailorProfile = getTailorProfile;
const updateTailorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { fullName, description, skills, availabilityStatus } = req.body;
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, userId))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor profile not found"
            });
        }
        const updateData = {};
        if (fullName)
            updateData.fullName = fullName;
        if (description)
            updateData.description = description;
        if (skills)
            updateData.skills = skills;
        if (availabilityStatus && ['available', 'busy', 'unavailable'].includes(availabilityStatus)) {
            updateData.availabilityStatus = availabilityStatus;
        }
        updateData.updatedAt = new Date();
        if (Object.keys(updateData).length === 1) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }
        const updated = yield index_js_1.default.update(schema_js_1.tailors)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, tailor[0].id))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Tailor profile updated successfully",
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating tailor profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update tailor profile",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateTailorProfile = updateTailorProfile;
// ============== TAILOR DASHBOARD ==============
const getTailorDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, userId))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }
        const assignedItems = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.tailorId, tailor[0].id));
        const stats = {
            totalAssignedItems: assignedItems.length,
            pendingItems: assignedItems.filter(i => i.itemStatus === 'PENDING').length,
            inProgressItems: assignedItems.filter(i => i.itemStatus === 'IN_PROGRESS').length,
            completedItems: assignedItems.filter(i => i.itemStatus === 'COMPLETED').length,
            totalEstimatedHours: assignedItems.reduce((sum, i) => sum + (i.estimatedHours || 0), 0)
        };
        return res.status(200).json({
            success: true,
            message: "Tailor dashboard retrieved successfully",
            data: {
                tailor: tailor[0],
                stats,
                recentItems: assignedItems.slice(0, 5)
            }
        });
    }
    catch (error) {
        console.error("Error retrieving dashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getTailorDashboard = getTailorDashboard;
// ============== ASSIGNED TASKS ==============
const getAssignedTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { status } = req.query;
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, userId))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }
        let query = index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.tailorId, tailor[0].id))
            .orderBy('assignedAt', 'desc');
        if (status && ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.itemStatus, status));
        }
        const items = yield query;
        return res.status(200).json({
            success: true,
            message: "Assigned tasks retrieved successfully",
            data: {
                count: items.length,
                items: items
            }
        });
    }
    catch (error) {
        console.error("Error retrieving tasks:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tasks",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getAssignedTasks = getAssignedTasks;
const getTaskDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, userId))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }
        const item = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)), (0, drizzle_orm_1.eq)(schema_js_1.orderItems.tailorId, tailor[0].id)))
            .limit(1);
        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, item[0].orderId))
            .limit(1);
        return res.status(200).json({
            success: true,
            message: "Task details retrieved successfully",
            data: {
                item: item[0],
                order: order.length > 0 ? order[0] : null
            }
        });
    }
    catch (error) {
        console.error("Error retrieving task:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve task",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getTaskDetails = getTaskDetails;
// ============== TASK MANAGEMENT ==============
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { newStatus, notes } = req.body;
        const validStatuses = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, userId))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }
        const item = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)), (0, drizzle_orm_1.eq)(schema_js_1.orderItems.tailorId, tailor[0].id)))
            .limit(1);
        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        const updated = yield index_js_1.default.update(schema_js_1.orderItems)
            .set({
            itemStatus: newStatus,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
            .returning();
        return res.status(200).json({
            success: true,
            message: `Task status updated to ${newStatus}`,
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateTaskStatus = updateTaskStatus;
// ============== STATISTICS ==============
const getTailorStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, userId))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }
        const allItems = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.tailorId, tailor[0].id));
        const stats = {
            totalItems: allItems.length,
            pending: allItems.filter(i => i.itemStatus === 'PENDING').length,
            inProgress: allItems.filter(i => i.itemStatus === 'IN_PROGRESS').length,
            completed: allItems.filter(i => i.itemStatus === 'COMPLETED').length,
            totalEstimatedHours: allItems.reduce((sum, i) => sum + (i.estimatedHours || 0), 0)
        };
        return res.status(200).json({
            success: true,
            message: "Tailor statistics retrieved",
            data: stats
        });
    }
    catch (error) {
        console.error("Error getting statistics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get statistics",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getTailorStatistics = getTailorStatistics;
