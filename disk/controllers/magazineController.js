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
exports.cancelOrder = exports.updateOrder = exports.getOrderDetails = exports.getMagazineOrders = exports.createOrder = exports.getAvailableWorkshops = exports.getMagazineDashboard = exports.updateMagazineProfile = exports.getMagazineProfile = void 0;
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// ============== MAGAZINE PROFILE ==============
// Get Magazine Profile
const getMagazineProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get magazine owned by this user
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine/Shop not found"
            });
        }
        const magazineData = magazine[0];
        // Get workshop details
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.id, magazineData.workshopId))
            .limit(1);
        return res.status(200).json({
            success: true,
            message: "Magazine profile retrieved successfully",
            data: {
                magazine: magazineData,
                workshop: workshop.length > 0 ? workshop[0] : null
            }
        });
    }
    catch (error) {
        console.error("Error retrieving magazine profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve magazine profile",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getMagazineProfile = getMagazineProfile;
// Update Magazine Profile
const updateMagazineProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { shopName, address, phone } = req.body;
        // Get magazine
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine/Shop not found"
            });
        }
        const magazineId = magazine[0].id;
        // Build update data
        const updateData = {};
        if (shopName)
            updateData.shopName = shopName;
        if (address)
            updateData.address = address;
        if (phone)
            updateData.phone = phone;
        updateData.updatedAt = new Date();
        if (Object.keys(updateData).length === 1) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }
        const updated = yield index_js_1.default.update(schema_js_1.magazines)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.id, magazineId))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Magazine profile updated successfully",
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating magazine profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update magazine profile",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateMagazineProfile = updateMagazineProfile;
// ============== MAGAZINE DASHBOARD ==============
// Get Magazine Dashboard
const getMagazineDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get magazine
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine/Shop not found"
            });
        }
        const magazineId = magazine[0].id;
        // Get order counts and statistics
        const [totalOrdersResult, recentOrdersResult] = yield Promise.all([
            index_js_1.default.select({ count: (0, drizzle_orm_1.count)() }).from(schema_js_1.orders)
                .where((0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazineId)),
            index_js_1.default.select().from(schema_js_1.orders)
                .where((0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazineId))
                .orderBy('createdAt', 'desc')
                .limit(5)
        ]);
        // Calculate order statistics
        const allOrders = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazineId));
        const orderStats = {
            total: allOrders.length,
            pending: allOrders.filter(o => o.currentStatus === 'PENDING').length,
            validated: allOrders.filter(o => o.currentStatus === 'VALIDATED').length,
            tailoring: allOrders.filter(o => o.currentStatus === 'TAILORING').length,
            packaging: allOrders.filter(o => o.currentStatus === 'PACKAGING').length,
            completed: allOrders.filter(o => o.currentStatus === 'COMPLETED').length,
            totalSpent: allOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0)
        };
        return res.status(200).json({
            success: true,
            message: "Magazine dashboard retrieved successfully",
            data: {
                magazine: magazine[0],
                statistics: orderStats,
                recentOrders: recentOrdersResult.map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.currentStatus,
                    totalPrice: order.totalPrice,
                    createdAt: order.createdAt,
                    estimatedCompletionDate: order.estimatedCompletionDate
                }))
            }
        });
    }
    catch (error) {
        console.error("Error retrieving magazine dashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve magazine dashboard",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getMagazineDashboard = getMagazineDashboard;
// ============== WORKSHOP DISCOVERY ==============
// Get Available Workshops
const getAvailableWorkshops = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        // Get all workshops
        let query = index_js_1.default.select().from(schema_js_1.workshops);
        if (search) {
            // Add simple search if needed
            // For now, we'll get all
        }
        const workshopsList = yield query;
        return res.status(200).json({
            success: true,
            message: "Available workshops retrieved successfully",
            data: {
                count: workshopsList.length,
                workshops: workshopsList.map(w => ({
                    id: w.id,
                    name: w.name,
                    description: w.description,
                    address: w.address,
                    phone: w.phone,
                    commissionPercentage: w.commissionPercentage
                }))
            }
        });
    }
    catch (error) {
        console.error("Error retrieving workshops:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve workshops",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getAvailableWorkshops = getAvailableWorkshops;
// ============== ORDER MANAGEMENT ==============
// Create New Order
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { workshopId, orderNumber, description, estimatedCompletionDate, totalPrice, items } = req.body;
        // Validation
        if (!workshopId || !orderNumber || !totalPrice || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: workshopId, orderNumber, totalPrice, items array"
            });
        }
        // Get magazine
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine/Shop not found"
            });
        }
        // Verify workshop exists
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.id, parseInt(workshopId)))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get a validator from the workshop (first available)
        const validator = yield index_js_1.default.select().from(schema_js_2.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_2.validators.workshopId, parseInt(workshopId)))
            .limit(1);
        if (validator.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Workshop has no validators to assign to this order"
            });
        }
        // Create order using transaction
        const result = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Check if order number already exists
            const existing = yield tx.select().from(schema_js_1.orders)
                .where((0, drizzle_orm_1.eq)(schema_js_1.orders.orderNumber, orderNumber))
                .limit(1);
            if (existing.length > 0) {
                throw new Error("Order number already exists");
            }
            // Create order
            const newOrder = yield tx.insert(schema_js_1.orders).values({
                magazineId: magazine[0].id,
                workshopId: parseInt(workshopId),
                validatorId: validator[0].id,
                orderNumber,
                description: description || null,
                estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
                totalPrice: parseFloat(totalPrice),
                currentStatus: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();
            return newOrder[0];
        }));
        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: result
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create order",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.createOrder = createOrder;
// Get All Orders for Magazine
const getMagazineOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { status } = req.query;
        // Get magazine
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine/Shop not found"
            });
        }
        // Get orders
        let query = index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazine[0].id))
            .orderBy('createdAt', 'desc');
        if (status && ['PENDING', 'VALIDATED', 'TAILORING', 'PACKAGING', 'COMPLETED'].includes(status)) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.orders.currentStatus, status));
        }
        const ordersList = yield query;
        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
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
exports.getMagazineOrders = getMagazineOrders;
// Get Single Order Details
const getOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        // Get magazine
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine/Shop not found"
            });
        }
        // Get order
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)), (0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazine[0].id)))
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
        return res.status(200).json({
            success: true,
            message: "Order details retrieved successfully",
            data: {
                order: order[0],
                items: items
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
exports.getOrderDetails = getOrderDetails;
// Update Order (only if PENDING)
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { description, estimatedCompletionDate, totalPrice } = req.body;
        // Get magazine
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine/Shop not found"
            });
        }
        // Get order
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)), (0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazine[0].id)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        // Can only update if PENDING
        if (order[0].currentStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: "Order can only be updated while in PENDING status"
            });
        }
        // Build update data
        const updateData = {};
        if (description)
            updateData.description = description;
        if (estimatedCompletionDate)
            updateData.estimatedCompletionDate = new Date(estimatedCompletionDate);
        if (totalPrice)
            updateData.totalPrice = parseFloat(totalPrice);
        updateData.updatedAt = new Date();
        if (Object.keys(updateData).length === 1) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }
        const updated = yield index_js_1.default.update(schema_js_1.orders)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update order",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateOrder = updateOrder;
// Cancel Order (only if PENDING)
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        // Get magazine
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine/Shop not found"
            });
        }
        // Get order
        const order = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)), (0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazine[0].id)))
            .limit(1);
        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        // Can only cancel if PENDING
        if (order[0].currentStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: "Order can only be cancelled while in PENDING status"
            });
        }
        // Delete order
        yield index_js_1.default.delete(schema_js_1.orders).where((0, drizzle_orm_1.eq)(schema_js_1.orders.id, parseInt(orderId)));
        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully"
        });
    }
    catch (error) {
        console.error("Error cancelling order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel order",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.cancelOrder = cancelOrder;
// ============== MISSING IMPORT FIX ==============
const schema_js_2 = require("../db/schemas/schema.js");
