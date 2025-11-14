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
exports.getOrderTimeline = exports.getOrderStatistics = exports.updateOrderStatus = exports.rejectOrder = exports.validateOrder = exports.getOrderWithItems = exports.getWorkshopOrders = void 0;
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// ============== VALIDATOR OPERATIONS (View all orders) ==============
// Get All Orders for Workshop (Validator View)
const getWorkshopOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { status, magazineId } = req.query;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only validators can access this endpoint"
            });
        }
        const workshopId = validator[0].workshopId;
        // Build query
        let query = index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, workshopId))
            .orderBy('createdAt', 'desc');
        if (status && ['PENDING', 'VALIDATED', 'TAILORING', 'PACKAGING', 'COMPLETED'].includes(status)) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.orders.currentStatus, status));
        }
        if (magazineId) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, parseInt(magazineId)));
        }
        const ordersList = yield query;
        return res.status(200).json({
            success: true,
            message: "Workshop orders retrieved successfully",
            data: {
                count: ordersList.length,
                orders: ordersList
            }
        });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getWorkshopOrders = getWorkshopOrders;
// Get Single Order with Full Details
const getOrderWithItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        // Get order
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        // Get order items
        const items = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.orderId, parseInt(orderId)));
        // Get order tracking history
        const tracking = yield index_js_1.default.select().from(schema_js_1.orderTracking)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderTracking.orderId, parseInt(orderId)))
            .orderBy('timestamp', 'desc');
        // Get magazine details
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.id, order[0].magazineId))
            .limit(1);
        // Get workshop details
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.id, order[0].workshopId))
            .limit(1);
        return res.status(200).json({
            success: true,
            message: "Order details retrieved successfully",
            data: {
                order: order[0],
                items: items,
                tracking: tracking,
                magazine: magazine.length > 0 ? magazine[0] : null,
                workshop: workshop.length > 0 ? workshop[0] : null
            }
        });
    }
    catch (error) {
        console.error("Error retrieving order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderWithItems = getOrderWithItems;
// ============== VALIDATOR OPERATIONS (Order Management) ==============
// Validate Order (PENDING → VALIDATED)
const validateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { notes } = req.body;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only validators can validate orders"
            });
        }
        // Get order
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)), (0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, validator[0].workshopId)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        if (order[0].currentStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Order is in ${order[0].currentStatus} status. Can only validate PENDING orders`
            });
        }
        // Use transaction
        const result = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update order status
            const updated = yield tx.update(schema_js_1.orders)
                .set({
                currentStatus: 'VALIDATED',
                validatorId: validator[0].id,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)))
                .returning();
            // Log tracking
            yield tx.insert(schema_js_1.orderTracking).values({
                orderId: parseInt(orderId),
                previousStatus: 'PENDING',
                newStatus: 'VALIDATED',
                validatorId: validator[0].id,
                description: notes || 'Order validated by validator',
                timestamp: new Date()
            });
            return updated[0];
        }));
        return res.status(200).json({
            success: true,
            message: "Order validated successfully",
            data: result
        });
    }
    catch (error) {
        console.error("Error validating order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to validate order",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.validateOrder = validateOrder;
// Reject Order (PENDING → back to PENDING with notes)
const rejectOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { rejectionReason } = req.body;
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only validators can reject orders"
            });
        }
        // Get order
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)), (0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, validator[0].workshopId)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        if (order[0].currentStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: "Can only reject PENDING orders"
            });
        }
        // Log rejection
        yield index_js_1.default.insert(schema_js_1.orderTracking).values({
            orderId: parseInt(orderId),
            previousStatus: 'PENDING',
            newStatus: 'PENDING',
            validatorId: validator[0].id,
            description: `Order rejected: ${rejectionReason}`,
            timestamp: new Date()
        });
        return res.status(200).json({
            success: true,
            message: "Order rejection logged. Magazine owner has been notified.",
            data: {
                orderId: order[0].id,
                status: "PENDING",
                rejectionReason: rejectionReason
            }
        });
    }
    catch (error) {
        console.error("Error rejecting order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject order",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.rejectOrder = rejectOrder;
// Update Order Status (VALIDATED → TAILORING → PACKAGING → COMPLETED)
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { newStatus, notes } = req.body;
        const validStatuses = ['TAILORING', 'PACKAGING', 'COMPLETED'];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only validators can update order status"
            });
        }
        // Get order
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)), (0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, validator[0].workshopId)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        // Validate status transition
        const statusOrder = ['PENDING', 'VALIDATED', 'TAILORING', 'PACKAGING', 'COMPLETED'];
        const currentIndex = statusOrder.indexOf(order[0].currentStatus);
        const newIndex = statusOrder.indexOf(newStatus);
        if (newIndex <= currentIndex) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition from ${order[0].currentStatus} to ${newStatus}. Can only move forward.`
            });
        }
        // Use transaction
        const result = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const previousStatus = order[0].currentStatus;
            // Update order status
            const updated = yield tx.update(schema_js_1.orders)
                .set({
                currentStatus: newStatus,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)))
                .returning();
            // Log tracking
            yield tx.insert(schema_js_1.orderTracking).values({
                orderId: parseInt(orderId),
                previousStatus: previousStatus,
                newStatus: newStatus,
                validatorId: validator[0].id,
                description: notes || `Order moved to ${newStatus}`,
                timestamp: new Date()
            });
            return updated[0];
        }));
        return res.status(200).json({
            success: true,
            message: `Order status updated to ${newStatus}`,
            data: result
        });
    }
    catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// ============== ORDER STATISTICS ==============
// Get Order Statistics for Workshop
const getOrderStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get validator to find workshop
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only validators can access this"
            });
        }
        const workshopId = validator[0].workshopId;
        // Get all orders for workshop
        const allOrders = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, workshopId));
        // Calculate statistics
        const stats = {
            total: allOrders.length,
            pending: allOrders.filter(o => o.currentStatus === 'PENDING').length,
            validated: allOrders.filter(o => o.currentStatus === 'VALIDATED').length,
            tailoring: allOrders.filter(o => o.currentStatus === 'TAILORING').length,
            packaging: allOrders.filter(o => o.currentStatus === 'PACKAGING').length,
            completed: allOrders.filter(o => o.currentStatus === 'COMPLETED').length,
            totalRevenue: allOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0)
        };
        return res.status(200).json({
            success: true,
            message: "Order statistics retrieved",
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
exports.getOrderStatistics = getOrderStatistics;
// Get Order Timeline/History
const getOrderTimeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        // Get order
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        // Get tracking history
        const timeline = yield index_js_1.default.select().from(schema_js_1.orderTracking)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderTracking.orderId, parseInt(orderId)))
            .orderBy('timestamp', 'asc');
        return res.status(200).json({
            success: true,
            message: "Order timeline retrieved",
            data: {
                orderId: order[0].id,
                orderNumber: order[0].orderNumber,
                currentStatus: order[0].currentStatus,
                timeline: timeline
            }
        });
    }
    catch (error) {
        console.error("Error getting timeline:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get timeline",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderTimeline = getOrderTimeline;
