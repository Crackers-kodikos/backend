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
exports.getWorkshopStatistics = exports.getWorkshopMagazines = exports.updateValidatorDetails = exports.getValidatorDetails = exports.getWorkshopValidators = exports.updateTailorDetails = exports.getTailorDetails = exports.getWorkshopTailors = exports.getWorkshopDashboard = exports.updateWorkshopProfile = exports.getWorkshopProfile = void 0;
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// ============== WORKSHOP PROFILE ==============
// Get Workshop Profile
const getWorkshopProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop owned by this user
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        const workshopData = workshop[0];
        // Get subscription plan details
        const plan = yield index_js_1.default.select().from(schema_js_1.subscriptionPlans)
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptionPlans.id, workshopData.subscriptionPlanId))
            .limit(1);
        return res.status(200).json({
            success: true,
            message: "Workshop profile retrieved successfully",
            data: {
                workshop: workshopData,
                subscriptionPlan: plan.length > 0 ? plan[0] : null
            }
        });
    }
    catch (error) {
        console.error("Error retrieving workshop profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve workshop profile",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getWorkshopProfile = getWorkshopProfile;
// Update Workshop Profile
const updateWorkshopProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { name, description, address, phone, commissionPercentage } = req.body;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        const workshopId = workshop[0].id;
        // Build update data
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        if (address)
            updateData.address = address;
        if (phone)
            updateData.phone = phone;
        if (commissionPercentage !== undefined)
            updateData.commissionPercentage = parseFloat(commissionPercentage);
        updateData.updatedAt = new Date();
        if (Object.keys(updateData).length === 1) { // Only updatedAt
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }
        const updated = yield index_js_1.default.update(schema_js_1.workshops)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.id, workshopId))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Workshop profile updated successfully",
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating workshop profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update workshop profile",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateWorkshopProfile = updateWorkshopProfile;
// ============== WORKSHOP DASHBOARD ==============
// Get Workshop Dashboard Overview
const getWorkshopDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        const workshopId = workshop[0].id;
        // Get counts for different entities
        const [tailorsCount, validatorsCount, magazinesCount, ordersCount] = yield Promise.all([
            index_js_1.default.select({ count: (0, drizzle_orm_1.count)() }).from(schema_js_1.tailors).where((0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, workshopId)),
            index_js_1.default.select({ count: (0, drizzle_orm_1.count)() }).from(schema_js_1.validators).where((0, drizzle_orm_1.eq)(schema_js_1.validators.workshopId, workshopId)),
            index_js_1.default.select({ count: (0, drizzle_orm_1.count)() }).from(schema_js_1.magazines).where((0, drizzle_orm_1.eq)(schema_js_1.magazines.workshopId, workshopId)),
            index_js_1.default.select({ count: (0, drizzle_orm_1.count)() }).from(schema_js_1.orders).where((0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, workshopId))
        ]);
        // Get recent orders
        const recentOrders = yield index_js_1.default.select().from(schema_js_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, workshopId))
            .orderBy('createdAt', 'desc')
            .limit(5);
        return res.status(200).json({
            success: true,
            message: "Workshop dashboard retrieved successfully",
            data: {
                workshop: workshop[0],
                stats: {
                    totalTailors: tailorsCount[0].count || 0,
                    totalValidators: validatorsCount[0].count || 0,
                    totalMagazines: magazinesCount[0].count || 0,
                    totalOrders: ordersCount[0].count || 0
                },
                recentOrders: recentOrders.map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.currentStatus,
                    createdAt: order.createdAt,
                    totalPrice: order.totalPrice
                }))
            }
        });
    }
    catch (error) {
        console.error("Error retrieving workshop dashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve workshop dashboard",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getWorkshopDashboard = getWorkshopDashboard;
// ============== TAILOR MANAGEMENT ==============
// Get All Tailors in Workshop
const getWorkshopTailors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { status } = req.query;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        const workshopId = workshop[0].id;
        // Get tailors
        let query = index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, workshopId));
        if (status && ['available', 'busy', 'unavailable'].includes(status)) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.tailors.availabilityStatus, status));
        }
        const tailorsList = yield query;
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
exports.getWorkshopTailors = getWorkshopTailors;
// Get Single Tailor Details
const getTailorDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { tailorId } = req.params;
        // Verify workshop ownership
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get tailor
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, parseInt(tailorId)), (0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, workshop[0].id)))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Tailor details retrieved successfully",
            data: tailor[0]
        });
    }
    catch (error) {
        console.error("Error retrieving tailor:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tailor",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getTailorDetails = getTailorDetails;
// Update Tailor Details (as workshop owner)
const updateTailorDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { tailorId } = req.params;
        const { description, skills, availabilityStatus } = req.body;
        // Verify workshop ownership
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Verify tailor belongs to workshop
        const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, parseInt(tailorId)), (0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, workshop[0].id)))
            .limit(1);
        if (tailor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tailor not found in this workshop"
            });
        }
        // Build update data
        const updateData = {};
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
            .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.id, parseInt(tailorId)))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Tailor details updated successfully",
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating tailor:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update tailor",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateTailorDetails = updateTailorDetails;
// ============== VALIDATOR MANAGEMENT ==============
// Get All Validators in Workshop
const getWorkshopValidators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        const workshopId = workshop[0].id;
        // Get validators
        const validatorsList = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.workshopId, workshopId));
        return res.status(200).json({
            success: true,
            message: "Validators retrieved successfully",
            data: {
                count: validatorsList.length,
                validators: validatorsList
            }
        });
    }
    catch (error) {
        console.error("Error retrieving validators:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve validators",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getWorkshopValidators = getWorkshopValidators;
// Get Single Validator Details
const getValidatorDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { validatorId } = req.params;
        // Verify workshop ownership
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get validator
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.validators.id, parseInt(validatorId)), (0, drizzle_orm_1.eq)(schema_js_1.validators.workshopId, workshop[0].id)))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Validator details retrieved successfully",
            data: validator[0]
        });
    }
    catch (error) {
        console.error("Error retrieving validator:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve validator",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getValidatorDetails = getValidatorDetails;
// Update Validator Details (as workshop owner)
const updateValidatorDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { validatorId } = req.params;
        const { fullName, description } = req.body;
        // Verify workshop ownership
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Verify validator belongs to workshop
        const validator = yield index_js_1.default.select().from(schema_js_1.validators)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.validators.id, parseInt(validatorId)), (0, drizzle_orm_1.eq)(schema_js_1.validators.workshopId, workshop[0].id)))
            .limit(1);
        if (validator.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Validator not found in this workshop"
            });
        }
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
            .where((0, drizzle_orm_1.eq)(schema_js_1.validators.id, parseInt(validatorId)))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Validator details updated successfully",
            data: updated[0]
        });
    }
    catch (error) {
        console.error("Error updating validator:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update validator",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.updateValidatorDetails = updateValidatorDetails;
// ============== MAGAZINE/SHOP MANAGEMENT ==============
// Get All Magazines Connected to Workshop
const getWorkshopMagazines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        const workshopId = workshop[0].id;
        // Get magazines
        const magazinesList = yield index_js_1.default.select().from(schema_js_1.magazines)
            .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.workshopId, workshopId));
        return res.status(200).json({
            success: true,
            message: "Magazines retrieved successfully",
            data: {
                count: magazinesList.length,
                magazines: magazinesList
            }
        });
    }
    catch (error) {
        console.error("Error retrieving magazines:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve magazines",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getWorkshopMagazines = getWorkshopMagazines;
// ============== WORKSHOP STATISTICS ==============
// Get Detailed Workshop Statistics
const getWorkshopStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        const workshopId = workshop[0].id;
        // Get all statistics
        const [tailorsCount, validatorsCount, magazinesCount, ordersData] = yield Promise.all([
            index_js_1.default.select({ count: (0, drizzle_orm_1.count)() }).from(schema_js_1.tailors).where((0, drizzle_orm_1.eq)(schema_js_1.tailors.workshopId, workshopId)),
            index_js_1.default.select({ count: (0, drizzle_orm_1.count)() }).from(schema_js_1.validators).where((0, drizzle_orm_1.eq)(schema_js_1.validators.workshopId, workshopId)),
            index_js_1.default.select({ count: (0, drizzle_orm_1.count)() }).from(schema_js_1.magazines).where((0, drizzle_orm_1.eq)(schema_js_1.magazines.workshopId, workshopId)),
            index_js_1.default.select().from(schema_js_1.orders).where((0, drizzle_orm_1.eq)(schema_js_1.orders.workshopId, workshopId))
        ]);
        // Calculate order statistics
        const orderStats = {
            total: ordersData.length,
            pending: ordersData.filter(o => o.currentStatus === 'PENDING').length,
            validated: ordersData.filter(o => o.currentStatus === 'VALIDATED').length,
            tailoring: ordersData.filter(o => o.currentStatus === 'TAILORING').length,
            packaging: ordersData.filter(o => o.currentStatus === 'PACKAGING').length,
            completed: ordersData.filter(o => o.currentStatus === 'COMPLETED').length,
            totalRevenue: ordersData.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0)
        };
        return res.status(200).json({
            success: true,
            message: "Workshop statistics retrieved successfully",
            data: {
                teamStats: {
                    tailors: tailorsCount[0].count || 0,
                    validators: validatorsCount[0].count || 0,
                    magazines: magazinesCount[0].count || 0
                },
                orderStats,
                workshop: {
                    id: workshop[0].id,
                    name: workshop[0].name,
                    commissionPercentage: workshop[0].commissionPercentage
                }
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
exports.getWorkshopStatistics = getWorkshopStatistics;
