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
exports.getGlobalItemStatistics = exports.getOrderItemStatistics = exports.getItemAssignmentDetails = exports.updateMultipleItemsStatus = exports.updateItemStatus = exports.getOrderItemsByTailor = exports.getOrderItemsByOrder = exports.getOrderItemDetails = exports.getOrderItems = void 0;
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// ============== ORDER ITEM RETRIEVAL ==============
// Get All Order Items
const getOrderItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, status, tailorId } = req.query;
        let query = index_js_1.default.select().from(schema_js_1.orderItems);
        if (orderId) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.orderId, parseInt(orderId)));
        }
        if (status && ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REVISION_NEEDED'].includes(status)) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.itemStatus, status));
        }
        if (tailorId) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.tailorId, parseInt(tailorId)));
        }
        const items = yield query;
        return res.status(200).json({
            success: true,
            message: "Order items retrieved successfully",
            data: {
                count: items.length,
                items: items
            }
        });
    }
    catch (error) {
        console.error("Error retrieving order items:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order items",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderItems = getOrderItems;
// Get Single Order Item Details
const getOrderItemDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId } = req.params;
        const item = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
            .limit(1);
        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }
        // Get related data
        const [order, tailor, validator] = yield Promise.all([
            index_js_1.default.select().from(schema_js_1.orders).where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, item[0].orderId)),
            item[0].tailorId ? index_js_1.default.select().from(schema_js_1.tailors).where((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, item[0].tailorId)) : Promise.resolve([]),
            item[0].assignedByValidatorId ? index_js_1.default.select().from(schema_js_1.validators).where((0, drizzle_orm_1.eq)(schema_js_1.validators.id, item[0].assignedByValidatorId)) : Promise.resolve([])
        ]);
        return res.status(200).json({
            success: true,
            message: "Order item details retrieved successfully",
            data: {
                item: item[0],
                order: order.length > 0 ? order[0] : null,
                tailor: tailor.length > 0 ? tailor[0] : null,
                validator: validator.length > 0 ? validator[0] : null
            }
        });
    }
    catch (error) {
        console.error("Error retrieving order item:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order item",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderItemDetails = getOrderItemDetails;
// Get Items by Order
const getOrderItemsByOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        // Verify order exists
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        // Get items
        const items = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.orderId, parseInt(orderId)));
        // Calculate stats
        const stats = {
            totalItems: items.length,
            pending: items.filter(i => i.itemStatus === 'PENDING').length,
            assigned: items.filter(i => i.itemStatus === 'ASSIGNED').length,
            inProgress: items.filter(i => i.itemStatus === 'IN_PROGRESS').length,
            completed: items.filter(i => i.itemStatus === 'COMPLETED').length,
            approved: items.filter(i => i.itemStatus === 'APPROVED').length,
            revisionNeeded: items.filter(i => i.itemStatus === 'REVISION_NEEDED').length
        };
        return res.status(200).json({
            success: true,
            message: "Order items retrieved successfully",
            data: {
                orderId: order[0].id,
                orderNumber: order[0].orderNumber,
                stats: stats,
                items: items
            }
        });
    }
    catch (error) {
        console.error("Error retrieving order items:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order items",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderItemsByOrder = getOrderItemsByOrder;
// Get Items by Tailor
const getOrderItemsByTailor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tailorId } = req.params;
        // Verify tailor exists
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, parseInt(tailorId)))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }
        // Get items
        const items = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.tailorId, parseInt(tailorId)));
        return res.status(200).json({
            success: true,
            message: "Tailor items retrieved successfully",
            data: {
                tailorId: tailor[0].id,
                tailorName: tailor[0].fullName,
                count: items.length,
                items: items
            }
        });
    }
    catch (error) {
        console.error("Error retrieving tailor items:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tailor items",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderItemsByTailor = getOrderItemsByTailor;
// ============== ITEM STATUS MANAGEMENT ==============
// Update Item Status
const updateItemStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId } = req.params;
        const { newStatus, completionDate } = req.body;
        const validStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REVISION_NEEDED'];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        const item = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
            .limit(1);
        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }
        const updateData = {
            itemStatus: newStatus,
            updatedAt: new Date()
        };
        if (completionDate && newStatus === 'COMPLETED') {
            updateData.completionDate = new Date(completionDate);
        }
        const updated = yield index_js_1.default.update(schema_js_1.orderItems)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
            .returning();
        return res.status(200).json({
            success: true,
            message: `Item status updated to ${newStatus}`,
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating item status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update item status",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateItemStatus = updateItemStatus;
// Update Multiple Items Status
const updateMultipleItemsStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemIds, newStatus } = req.body;
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "itemIds must be a non-empty array"
            });
        }
        const validStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        // Update all items in transaction
        const updated = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const results = [];
            for (const itemId of itemIds) {
                const result = yield tx.update(schema_js_1.orderItems)
                    .set({
                    itemStatus: newStatus,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
                    .returning();
                if (result.length > 0) {
                    results.push(result[0]);
                }
            }
            return results;
        }));
        return res.status(200).json({
            success: true,
            message: `${updated.length} items updated to ${newStatus}`,
            data: {
                updatedCount: updated.length,
                items: updated
            }
        });
    }
    catch (error) {
        console.error("Error updating multiple items:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update multiple items",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateMultipleItemsStatus = updateMultipleItemsStatus;
// ============== ITEM ASSIGNMENT ==============
// Get Item Assignment Details
const getItemAssignmentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId } = req.params;
        const item = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
            .limit(1);
        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }
        const assignmentDetails = {
            itemId: item[0].id,
            status: item[0].itemStatus,
            assignedAt: item[0].assignedAt,
            estimatedHours: item[0].estimatedHours,
            completionDate: item[0].completionDate,
            tailor: null,
            validator: null
        };
        if (item[0].tailorId) {
            const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
                .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, item[0].tailorId))
                .limit(1);
            if (tailor.length > 0) {
                assignmentDetails.tailor = tailor[0];
            }
        }
        if (item[0].assignedByValidatorId) {
            const validator = yield index_js_1.default.select().from(schema_js_1.validators)
                .where((0, drizzle_orm_1.eq)(schema_js_1.validators.id, item[0].assignedByValidatorId))
                .limit(1);
            if (validator.length > 0) {
                assignmentDetails.validator = validator[0];
            }
        }
        return res.status(200).json({
            success: true,
            message: "Item assignment details retrieved",
            data: assignmentDetails
        });
    }
    catch (error) {
        console.error("Error retrieving assignment details:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve assignment details",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getItemAssignmentDetails = getItemAssignmentDetails;
// ============== STATISTICS ==============
// Get Order Item Statistics
const getOrderItemStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        const items = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.orderId, parseInt(orderId)));
        const stats = {
            totalItems: items.length,
            statusBreakdown: {
                pending: items.filter(i => i.itemStatus === 'PENDING').length,
                assigned: items.filter(i => i.itemStatus === 'ASSIGNED').length,
                inProgress: items.filter(i => i.itemStatus === 'IN_PROGRESS').length,
                completed: items.filter(i => i.itemStatus === 'COMPLETED').length,
                approved: items.filter(i => i.itemStatus === 'APPROVED').length,
                revisionNeeded: items.filter(i => i.itemStatus === 'REVISION_NEEDED').length
            },
            totalEstimatedHours: items.reduce((sum, i) => sum + (i.estimatedHours || 0), 0),
            completionPercentage: items.length > 0
                ? Math.round((items.filter(i => i.itemStatus === 'COMPLETED' || i.itemStatus === 'APPROVED').length / items.length) * 100)
                : 0
        };
        return res.status(200).json({
            success: true,
            message: "Order item statistics retrieved",
            data: {
                orderId: order[0].id,
                orderNumber: order[0].orderNumber,
                stats: stats
            }
        });
    }
    catch (error) {
        console.error("Error retrieving statistics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve statistics",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderItemStatistics = getOrderItemStatistics;
// Get Global Item Statistics
const getGlobalItemStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allItems = yield index_js_1.default.select().from(schema_js_1.orderItems);
        const stats = {
            totalItems: allItems.length,
            byStatus: {
                pending: allItems.filter(i => i.itemStatus === 'PENDING').length,
                assigned: allItems.filter(i => i.itemStatus === 'ASSIGNED').length,
                inProgress: allItems.filter(i => i.itemStatus === 'IN_PROGRESS').length,
                completed: allItems.filter(i => i.itemStatus === 'COMPLETED').length,
                approved: allItems.filter(i => i.itemStatus === 'APPROVED').length,
                revisionNeeded: allItems.filter(i => i.itemStatus === 'REVISION_NEEDED').length
            },
            averageEstimatedHours: allItems.length > 0
                ? Math.round(allItems.reduce((sum, i) => sum + (i.estimatedHours || 0), 0) / allItems.length)
                : 0
        };
        return res.status(200).json({
            success: true,
            message: "Global item statistics retrieved",
            data: stats
        });
    }
    catch (error) {
        console.error("Error retrieving global statistics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve global statistics",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getGlobalItemStatistics = getGlobalItemStatistics;
