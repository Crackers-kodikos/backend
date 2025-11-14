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
exports.exportOrderTrackingReport = exports.getAverageProcessingTime = exports.getTrackingStatisticsByStatus = exports.getMagazineTrackingDashboard = exports.getOrderStatusSummary = exports.getRecentTrackingEvents = exports.getMagazineOrdersTracking = exports.getOrderTrackingHistory = void 0;
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// ============== ORDER TRACKING ==============
// Get Order Tracking History
const getOrderTrackingHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Get tracking history
        const tracking = yield index_js_1.default.select().from(schema_js_1.orderTracking)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderTracking.orderId, parseInt(orderId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.orderTracking.timestamp));
        return res.status(200).json({
            success: true,
            message: "Order tracking history retrieved successfully",
            data: {
                orderId: order[0].id,
                orderNumber: order[0].orderNumber,
                currentStatus: order[0].currentStatus,
                createdAt: order[0].createdAt,
                trackingHistory: tracking
            }
        });
    }
    catch (error) {
        console.error("Error retrieving tracking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tracking history",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderTrackingHistory = getOrderTrackingHistory;
// Get Magazine Orders Tracking
const getMagazineOrdersTracking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                message: "Magazine not found"
            });
        }
        // Get orders
        let query = index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazine[0].id))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.orders.createdAt));
        if (status && ['PENDING', 'VALIDATED', 'TAILORING', 'PACKAGING', 'COMPLETED'].includes(status)) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.orders.currentStatus, status));
        }
        const ordersList = yield query;
        // Get tracking for each order
        const ordersWithTracking = yield Promise.all(ordersList.map((order) => __awaiter(void 0, void 0, void 0, function* () {
            const tracking = yield index_js_1.default.select().from(schema_js_1.orderTracking)
                .where((0, drizzle_orm_1.eq)(schema_js_1.orderTracking.orderId, order.id))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.orderTracking.timestamp))
                .limit(5); // Last 5 events
            return Object.assign(Object.assign({}, order), { lastEvents: tracking });
        })));
        return res.status(200).json({
            success: true,
            message: "Magazine orders tracking retrieved successfully",
            data: {
                magazineId: magazine[0].id,
                shopName: magazine[0].shopName,
                totalOrders: ordersList.length,
                orders: ordersWithTracking
            }
        });
    }
    catch (error) {
        console.error("Error retrieving magazine tracking:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve magazine tracking",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getMagazineOrdersTracking = getMagazineOrdersTracking;
// Get Recent Tracking Events
const getRecentTrackingEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 20 } = req.query;
        const events = yield index_js_1.default.select().from(schema_js_1.orderTracking)
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.orderTracking.timestamp))
            .limit(parseInt(limit));
        return res.status(200).json({
            success: true,
            message: "Recent tracking events retrieved successfully",
            data: {
                count: events.length,
                events: events
            }
        });
    }
    catch (error) {
        console.error("Error retrieving events:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tracking events",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getRecentTrackingEvents = getRecentTrackingEvents;
// ============== ORDER STATUS SUMMARY ==============
// Get Order Status Summary
const getOrderStatusSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Get tracking
        const tracking = yield index_js_1.default.select().from(schema_js_1.orderTracking)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderTracking.orderId, parseInt(orderId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.orderTracking.timestamp));
        // Build summary
        const statusTransitions = tracking.reduce((acc, event) => {
            const statusKey = event.newStatus.toLowerCase();
            if (!acc[statusKey]) {
                acc[statusKey] = {
                    status: event.newStatus,
                    timestamp: event.timestamp,
                    description: event.description,
                    validatorId: event.validatorId
                };
            }
            return acc;
        }, {});
        const summary = {
            orderId: order[0].id,
            orderNumber: order[0].orderNumber,
            currentStatus: order[0].currentStatus,
            createdAt: order[0].createdAt,
            estimatedCompletionDate: order[0].estimatedCompletionDate,
            totalPrice: order[0].totalPrice,
            statusTransitions: statusTransitions,
            totalEvents: tracking.length
        };
        return res.status(200).json({
            success: true,
            message: "Order status summary retrieved successfully",
            data: summary
        });
    }
    catch (error) {
        console.error("Error retrieving summary:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve status summary",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getOrderStatusSummary = getOrderStatusSummary;
// ============== MAGAZINE TRACKING DASHBOARD ==============
// Get Magazine Tracking Dashboard
const getMagazineTrackingDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get magazine
        const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, userId))
            .limit(1);
        if (magazine.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Magazine not found"
            });
        }
        // Get orders
        const allOrders = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.magazineId, magazine[0].id));
        // Calculate statistics
        const stats = {
            totalOrders: allOrders.length,
            pending: allOrders.filter(o => o.currentStatus === 'PENDING').length,
            validated: allOrders.filter(o => o.currentStatus === 'VALIDATED').length,
            tailoring: allOrders.filter(o => o.currentStatus === 'TAILORING').length,
            packaging: allOrders.filter(o => o.currentStatus === 'PACKAGING').length,
            completed: allOrders.filter(o => o.currentStatus === 'COMPLETED').length,
            totalSpent: allOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0),
            completionPercentage: allOrders.length > 0
                ? Math.round((allOrders.filter(o => o.currentStatus === 'COMPLETED').length / allOrders.length) * 100)
                : 0
        };
        // Get recent orders
        const recentOrders = allOrders.slice(0, 5).map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.currentStatus,
            totalPrice: o.totalPrice,
            createdAt: o.createdAt
        }));
        return res.status(200).json({
            success: true,
            message: "Magazine tracking dashboard retrieved successfully",
            data: {
                magazine: {
                    id: magazine[0].id,
                    shopName: magazine[0].shopName,
                    address: magazine[0].address
                },
                statistics: stats,
                recentOrders: recentOrders
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
exports.getMagazineTrackingDashboard = getMagazineTrackingDashboard;
// ============== TRACKING STATISTICS ==============
// Get Tracking Statistics by Status
const getTrackingStatisticsByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allOrders = yield index_js_1.default.select().from(schema_js_1.orders);
        const stats = {
            totalOrders: allOrders.length,
            byStatus: {
                pending: allOrders.filter(o => o.currentStatus === 'PENDING').length,
                validated: allOrders.filter(o => o.currentStatus === 'VALIDATED').length,
                tailoring: allOrders.filter(o => o.currentStatus === 'TAILORING').length,
                packaging: allOrders.filter(o => o.currentStatus === 'PACKAGING').length,
                completed: allOrders.filter(o => o.currentStatus === 'COMPLETED').length
            },
            percentages: {
                pending: allOrders.length > 0 ? Math.round((allOrders.filter(o => o.currentStatus === 'PENDING').length / allOrders.length) * 100) : 0,
                validated: allOrders.length > 0 ? Math.round((allOrders.filter(o => o.currentStatus === 'VALIDATED').length / allOrders.length) * 100) : 0,
                tailoring: allOrders.length > 0 ? Math.round((allOrders.filter(o => o.currentStatus === 'TAILORING').length / allOrders.length) * 100) : 0,
                packaging: allOrders.length > 0 ? Math.round((allOrders.filter(o => o.currentStatus === 'PACKAGING').length / allOrders.length) * 100) : 0,
                completed: allOrders.length > 0 ? Math.round((allOrders.filter(o => o.currentStatus === 'COMPLETED').length / allOrders.length) * 100) : 0
            },
            totalRevenue: allOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0),
            averageOrderValue: allOrders.length > 0
                ? Math.round(allOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0) / allOrders.length)
                : 0
        };
        return res.status(200).json({
            success: true,
            message: "Tracking statistics retrieved successfully",
            data: stats
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
exports.getTrackingStatisticsByStatus = getTrackingStatisticsByStatus;
// Get Average Order Processing Time
const getAverageProcessingTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const completedOrders = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.currentStatus, 'COMPLETED'));
        if (completedOrders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No completed orders yet",
                data: {
                    averageProcessingTime: null,
                    totalOrders: 0
                }
            });
        }
        const processingTimes = completedOrders.map(order => {
            const createdTime = new Date(order.createdAt).getTime();
            const completedTime = new Date(order.updatedAt).getTime();
            return Math.round((completedTime - createdTime) / (1000 * 60 * 60 * 24)); // days
        });
        const averageTime = Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length);
        return res.status(200).json({
            success: true,
            message: "Average processing time calculated successfully",
            data: {
                averageProcessingTime: averageTime,
                unit: "days",
                totalCompleted: completedOrders.length,
                minTime: Math.min(...processingTimes),
                maxTime: Math.max(...processingTimes)
            }
        });
    }
    catch (error) {
        console.error("Error calculating processing time:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to calculate processing time",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getAverageProcessingTime = getAverageProcessingTime;
// ============== EXPORT TRACKING DATA ==============
// Export Order Tracking Report
const exportOrderTrackingReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const tracking = yield index_js_1.default.select().from(schema_js_1.orderTracking)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderTracking.orderId, parseInt(orderId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.orderTracking.timestamp));
        const report = {
            reportDate: new Date().toISOString(),
            order: {
                id: order[0].id,
                orderNumber: order[0].orderNumber,
                status: order[0].currentStatus,
                createdAt: order[0].createdAt,
                estimatedCompletion: order[0].estimatedCompletionDate,
                totalPrice: order[0].totalPrice,
                description: order[0].description
            },
            trackingDetails: tracking,
            summary: {
                totalEvents: tracking.length,
                firstEvent: tracking.length > 0 ? tracking[tracking.length - 1].timestamp : null,
                lastEvent: tracking.length > 0 ? tracking[0].timestamp : null
            }
        };
        return res.status(200).json({
            success: true,
            message: "Order tracking report generated successfully",
            data: report
        });
    }
    catch (error) {
        console.error("Error generating report:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate report",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.exportOrderTrackingReport = exportOrderTrackingReport;
