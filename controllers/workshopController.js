import { workshops, users, tailors, validators, magazines, subscriptionPlans, orders } from '../db/schemas/schema.js';
import { eq, and, count } from 'drizzle-orm';
import db from "../db/index.js";
import { config } from "../config/env.js";

// ============== WORKSHOP PROFILE ==============

// Get Workshop Profile
export const getWorkshopProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop owned by this user
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    const workshopData = workshop[0];

    // Get subscription plan details
    const plan = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, workshopData.subscriptionPlanId))
      .limit(1);

    return res.status(200).json({
      success: true,
      message: "Workshop profile retrieved successfully",
      data: {
        workshop: workshopData,
        subscriptionPlan: plan.length > 0 ? plan[0] : null
      }
    });

  } catch (error) {
    console.error("Error retrieving workshop profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve workshop profile",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Workshop Profile
export const updateWorkshopProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, address, phone, commissionPercentage } = req.body;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
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
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (commissionPercentage !== undefined) updateData.commissionPercentage = parseFloat(commissionPercentage);
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length === 1) { // Only updatedAt
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    const updated = await db.update(workshops)
      .set(updateData)
      .where(eq(workshops.id, workshopId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Workshop profile updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating workshop profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update workshop profile",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== WORKSHOP DASHBOARD ==============

// Get Workshop Dashboard Overview
export const getWorkshopDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    const workshopId = workshop[0].id;

    // Get counts for different entities
    const [tailorsCount, validatorsCount, magazinesCount, ordersCount] = await Promise.all([
      db.select({ count: count() }).from(tailors).where(eq(tailors.workshopId, workshopId)),
      db.select({ count: count() }).from(validators).where(eq(validators.workshopId, workshopId)),
      db.select({ count: count() }).from(magazines).where(eq(magazines.workshopId, workshopId)),
      db.select({ count: count() }).from(orders).where(eq(orders.workshopId, workshopId))
    ]);

    // Get recent orders
    const recentOrders = await db.select().from(orders)
      .where(eq(orders.workshopId, workshopId))
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

  } catch (error) {
    console.error("Error retrieving workshop dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve workshop dashboard",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== TAILOR MANAGEMENT ==============

// Get All Tailors in Workshop
export const getWorkshopTailors = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    const workshopId = workshop[0].id;

    // Get tailors
    let query = db.select().from(tailors)
      .where(eq(tailors.workshopId, workshopId));

    if (status && ['available', 'busy', 'unavailable'].includes(status)) {
      query = query.where(eq(tailors.availabilityStatus, status));
    }

    const tailorsList = await query;

    return res.status(200).json({
      success: true,
      message: "Tailors retrieved successfully",
      data: {
        count: tailorsList.length,
        tailors: tailorsList
      }
    });

  } catch (error) {
    console.error("Error retrieving tailors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tailors",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Single Tailor Details
export const getTailorDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tailorId } = req.params;

    // Verify workshop ownership
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get tailor
    const tailor = await db.select().from(tailors)
      .where(and(
        eq(tailors.id, parseInt(tailorId)),
        eq(tailors.workshopId, workshop[0].id)
      ))
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

  } catch (error) {
    console.error("Error retrieving tailor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tailor",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Tailor Details (as workshop owner)
export const updateTailorDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tailorId } = req.params;
    const { description, skills, availabilityStatus } = req.body;

    // Verify workshop ownership
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Verify tailor belongs to workshop
    const tailor = await db.select().from(tailors)
      .where(and(
        eq(tailors.id, parseInt(tailorId)),
        eq(tailors.workshopId, workshop[0].id)
      ))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor not found in this workshop"
      });
    }

    // Build update data
    const updateData = {};
    if (description) updateData.description = description;
    if (skills) updateData.skills = skills;
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

    const updated = await db.update(tailors)
      .set(updateData)
      .where(eq(tailors.id, parseInt(tailorId)))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Tailor details updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating tailor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update tailor",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== VALIDATOR MANAGEMENT ==============

// Get All Validators in Workshop
export const getWorkshopValidators = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    const workshopId = workshop[0].id;

    // Get validators
    const validatorsList = await db.select().from(validators)
      .where(eq(validators.workshopId, workshopId));

    return res.status(200).json({
      success: true,
      message: "Validators retrieved successfully",
      data: {
        count: validatorsList.length,
        validators: validatorsList
      }
    });

  } catch (error) {
    console.error("Error retrieving validators:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve validators",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Single Validator Details
export const getValidatorDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { validatorId } = req.params;

    // Verify workshop ownership
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get validator
    const validator = await db.select().from(validators)
      .where(and(
        eq(validators.id, parseInt(validatorId)),
        eq(validators.workshopId, workshop[0].id)
      ))
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

  } catch (error) {
    console.error("Error retrieving validator:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve validator",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Validator Details (as workshop owner)
export const updateValidatorDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { validatorId } = req.params;
    const { fullName, description } = req.body;

    // Verify workshop ownership
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Verify validator belongs to workshop
    const validator = await db.select().from(validators)
      .where(and(
        eq(validators.id, parseInt(validatorId)),
        eq(validators.workshopId, workshop[0].id)
      ))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator not found in this workshop"
      });
    }

    // Build update data
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (description) updateData.description = description;
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length === 1) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    const updated = await db.update(validators)
      .set(updateData)
      .where(eq(validators.id, parseInt(validatorId)))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Validator details updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating validator:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update validator",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== MAGAZINE/SHOP MANAGEMENT ==============

// Get All Magazines Connected to Workshop
export const getWorkshopMagazines = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    const workshopId = workshop[0].id;

    // Get magazines
    const magazinesList = await db.select().from(magazines)
      .where(eq(magazines.workshopId, workshopId));

    return res.status(200).json({
      success: true,
      message: "Magazines retrieved successfully",
      data: {
        count: magazinesList.length,
        magazines: magazinesList
      }
    });

  } catch (error) {
    console.error("Error retrieving magazines:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve magazines",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== WORKSHOP STATISTICS ==============

// Get Detailed Workshop Statistics
export const getWorkshopStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    const workshopId = workshop[0].id;

    // Get all statistics
    const [tailorsCount, validatorsCount, magazinesCount, ordersData] = await Promise.all([
      db.select({ count: count() }).from(tailors).where(eq(tailors.workshopId, workshopId)),
      db.select({ count: count() }).from(validators).where(eq(validators.workshopId, workshopId)),
      db.select({ count: count() }).from(magazines).where(eq(magazines.workshopId, workshopId)),
      db.select().from(orders).where(eq(orders.workshopId, workshopId))
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

  } catch (error) {
    console.error("Error retrieving statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve statistics",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
