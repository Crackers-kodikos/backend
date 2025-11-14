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
exports.getValidatorStatistics = exports.reviewCompletedItem = exports.getTailorWorkload = exports.getValidatorAssignments = exports.assignItemToTailor = exports.getAvailableTailors = exports.getValidatorDashboard = exports.updateValidatorProfile = exports.getValidatorProfile = void 0;
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// ============== VALIDATOR PROFILE ==============
// Get Validator Profile
const getValidatorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator profile not found"
            });
        }
        const validatorData = validator[0];
        // Get workshop details
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.id, validatorData.workshopId))
            .limit(1);
        return res.status(200).json({
            success: true,
            message: "Validator profile retrieved successfully",
            data: {
                validator: validatorData,
                workshop: workshop.length > 0 ? workshop[0] : null
            }
        });
    }
    catch (error) {
        console.error("Error retrieving validator profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve validator profile",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getValidatorProfile = getValidatorProfile;
// Update Validator Profile
const updateValidatorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { fullName, description } = req.body;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator profile not found"
            });
        }
        const validatorId = validator[0].id;
        // Build update data
        const updateData = {};
        if (fullName)
            updateData.fullName = fullName;
        if (description)
            updateData.description = description;
        updateData.updatedAt = new Date();
        if (Object.keys(updateData).length === 1) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }
        const updated = yield index_js_1.default.update(schema_js_1.validators)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.id, validatorId))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Validator profile updated successfully",
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating validator profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update validator profile",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateValidatorProfile = updateValidatorProfile;
// ============== VALIDATOR DASHBOARD ==============
// Get Validator Dashboard
const getValidatorDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found"
            });
        }
        const workshopId = validator[0].workshopId;
        // Get pending orders
        const pendingOrders = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, workshopId), (0, drizzle_orm_1.eq)(schema_js_1.orders.currentStatus, 'PENDING')));
        // Get all orders for stats
        const allOrders = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, workshopId));
        // Get available tailors
        const availableTailors = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, workshopId), (0, drizzle_orm_1.eq)(schema_js_1.tailors.availabilityStatus, 'available')));
        // Get recent assignments
        const recentAssignments = yield index_js_1.default.select().from(schema_js_1.validatorAssignmentLog)
            .orderBy('assignedAt', 'desc')
            .limit(5);
        // Calculate stats
        const stats = {
            pendingValidation: pendingOrders.length,
            totalOrders: allOrders.length,
            completedToday: allOrders.filter(o => o.currentStatus === 'COMPLETED').length,
            availableTailors: availableTailors.length,
            ordersInProgress: allOrders.filter(o => o.currentStatus === 'TAILORING' || o.currentStatus === 'PACKAGING').length
        };
        return res.status(200).json({
            success: true,
            message: "Validator dashboard retrieved successfully",
            data: {
                validator: validator[0],
                stats,
                pendingOrders: pendingOrders.map(o => ({
                    id: o.id,
                    orderNumber: o.orderNumber,
                    magazineId: o.magazineId,
                    createdAt: o.createdAt
                })),
                recentAssignments
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
exports.getValidatorDashboard = getValidatorDashboard;
// ============== TAILOR MANAGEMENT ==============
// Get Available Tailors
const getAvailableTailors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found"
            });
        }
        const workshopId = validator[0].workshopId;
        // Get tailors
        const tailorsList = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, workshopId));
        return res.status(200).json({
            success: true,
            message: "Tailors retrieved successfully",
            data: {
                count: tailorsList.length,
                tailors: tailorsList
            }
        });
    }
    catch (error) {
        console.error("Error retrieving tailors:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tailors",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getAvailableTailors = getAvailableTailors;
// ============== ITEM ASSIGNMENT ==============
// Assign Order Item to Tailor
const assignItemToTailor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { tailorId, estimatedHours, notes } = req.body;
        if (!tailorId || !estimatedHours) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: tailorId, estimatedHours"
            });
        }
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found"
            });
        }
        // Verify tailor belongs to same workshop
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, parseInt(tailorId)), (0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, validator[0].workshopId)))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tailor not found or not from this workshop"
            });
        }
        // Get order item
        const item = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
            .limit(1);
        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }
        // Use transaction
        const result = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update order item
            const updated = yield tx.update(schema_js_1.orderItems)
                .set({
                tailorId: parseInt(tailorId),
                estimatedHours: parseInt(estimatedHours),
                assignedByValidatorId: validator[0].id,
                assignedAt: new Date(),
                itemStatus: 'ASSIGNED'
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
                .returning();
            // Log assignment
            yield tx.insert(schema_js_1.validatorAssignmentLog).values({
                validatorId: validator[0].id,
                tailorId: parseInt(tailorId),
                orderItemId: parseInt(itemId),
                estimatedHours: parseInt(estimatedHours),
                notes: notes || `Item assigned to ${tailor[0].fullName}`,
                assignedAt: new Date()
            });
            return updated[0];
        }));
        return res.status(200).json({
            success: true,
            message: "Item assigned to tailor successfully",
            data: result
        });
    }
    catch (error) {
        console.error("Error assigning item:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to assign item",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.assignItemToTailor = assignItemToTailor;
// Get Assignments Made by Validator
const getValidatorAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found"
            });
        }
        // Get assignments
        const assignments = yield index_js_1.default.select().from(schema_js_1.validatorAssignmentLog)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validatorAssignmentLog.validatorId, validator[0].id))
            .orderBy('assignedAt', 'desc');
        return res.status(200).json({
            success: true,
            message: "Assignments retrieved successfully",
            data: {
                count: assignments.length,
                assignments: assignments
            }
        });
    }
    catch (error) {
        console.error("Error retrieving assignments:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve assignments",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getValidatorAssignments = getValidatorAssignments;
// ============== WORKLOAD MONITORING ==============
// Get Tailor Workload
const getTailorWorkload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { tailorId } = req.params;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found"
            });
        }
        // Get tailor
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, parseInt(tailorId)), (0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, validator[0].workshopId)))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }
        // Get assigned items
        const assignedItems = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.tailorId, parseInt(tailorId)));
        // Calculate workload
        const workload = {
            totalAssignedItems: assignedItems.length,
            pendingItems: assignedItems.filter(i => i.itemStatus === 'PENDING').length,
            inProgressItems: assignedItems.filter(i => i.itemStatus === 'IN_PROGRESS').length,
            completedItems: assignedItems.filter(i => i.itemStatus === 'COMPLETED').length,
            totalEstimatedHours: assignedItems.reduce((sum, i) => sum + (i.estimatedHours || 0), 0)
        };
        return res.status(200).json({
            success: true,
            message: "Tailor workload retrieved successfully",
            data: {
                tailor: tailor[0],
                workload: workload,
                assignedItems: assignedItems
            }
        });
    }
    catch (error) {
        console.error("Error retrieving workload:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve workload",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getTailorWorkload = getTailorWorkload;
// ============== QUALITY CONTROL ==============
// Review Completed Item
const reviewCompletedItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { approved, feedback } = req.body;
        if (approved === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: approved (boolean)"
            });
        }
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found"
            });
        }
        // Get item
        const item = yield index_js_1.default.select().from(schema_js_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
            .limit(1);
        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }
        if (item[0].itemStatus !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: "Item must be COMPLETED to review"
            });
        }
        // Use transaction
        const result = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const newStatus = approved ? 'APPROVED' : 'REVISION_NEEDED';
            const updated = yield tx.update(schema_js_1.orderItems)
                .set({
                itemStatus: newStatus,
                reviewedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.orderItems.id, parseInt(itemId)))
                .returning();
            return updated[0];
        }));
        return res.status(200).json({
            success: true,
            message: approved ? "Item approved" : "Item sent for revision",
            data: {
                itemId: result.id,
                approved: approved,
                status: result.itemStatus,
                feedback: feedback || null
            }
        });
    }
    catch (error) {
        console.error("Error reviewing item:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to review item",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.reviewCompletedItem = reviewCompletedItem;
// ============== STATISTICS ==============
// Get Validator Statistics
const getValidatorStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, userId))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found"
            });
        }
        const workshopId = validator[0].workshopId;
        // Get all data
        const [assignments, orders, tailors] = yield Promise.all([
            index_js_1.default.select().from(schema_js_1.validatorAssignmentLog)
                .where((0, drizzle_orm_1.eq)(schema_js_1.validatorAssignmentLog.validatorId, validator[0].id)),
            index_js_1.default.select().from(orders)
                .where((0, drizzle_orm_1.eq)(orders.workshopId, workshopId)),
            index_js_1.default.select().from(tailors)
                .where((0, drizzle_orm_1.eq)(tailors.workshopId, workshopId))
        ]);
        const stats = {
            totalAssignments: assignments.length,
            ordersValidated: orders.filter(o => o.validatorId === validator[0].id).length,
            ordersCompleted: orders.filter(o => o.currentStatus === 'COMPLETED').length,
            totalTailors: tailors.length,
            totalEstimatedHours: assignments.reduce((sum, a) => sum + (a.estimatedHours || 0), 0)
        };
        return res.status(200).json({
            success: true,
            message: "Validator statistics retrieved",
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
exports.getValidatorStatistics = getValidatorStatistics;
