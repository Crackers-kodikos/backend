import { validators, tailors, users, workshops, orders, orderItems, validatorAssignmentLog } from '../db/schemas/schema.js';
import { eq, and, count } from 'drizzle-orm';
import db from "../db/index.js";
import { config } from "../config/env.js";

// ============== VALIDATOR PROFILE ==============

// Get Validator Profile
export const getValidatorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get validator
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator profile not found"
      });
    }

    const validatorData = validator[0];

    // Get workshop details
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.id, validatorData.workshopId))
      .limit(1);

    return res.status(200).json({
      success: true,
      message: "Validator profile retrieved successfully",
      data: {
        validator: validatorData,
        workshop: workshop.length > 0 ? workshop[0] : null
      }
    });

  } catch (error) {
    console.error("Error retrieving validator profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve validator profile",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Validator Profile
export const updateValidatorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, description } = req.body;

    // Get validator
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
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
      .where(eq(validators.id, validatorId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Validator profile updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating validator profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update validator profile",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== VALIDATOR DASHBOARD ==============

// Get Validator Dashboard
export const getValidatorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get validator
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator not found"
      });
    }

    const workshopId = validator[0].workshopId;

    // Get pending orders
    const pendingOrders = await db.select().from(orders)
      .where(and(
        eq(orders.workshopId, workshopId),
        eq(orders.currentStatus, 'PENDING')
      ));

    // Get all orders for stats
    const allOrders = await db.select().from(orders)
      .where(eq(orders.workshopId, workshopId));

    // Get available tailors
    const availableTailors = await db.select().from(tailors)
      .where(and(
        eq(tailors.workshopId, workshopId),
        eq(tailors.availabilityStatus, 'available')
      ));

    // Get recent assignments
    const recentAssignments = await db.select().from(validatorAssignmentLog)
      .orderBy('assignedAt', 'desc')
      .limit(5);

    // Calculate stats
    const stats = {
      pendingValidation: pendingOrders.length,
      totalOrders: allOrders.length,
      completedToday: allOrders.filter(o => o.currentStatus === 'COMPLETED').length,
      availableTailors: availableTailors.length,
      ordersInProgress: allOrders.filter(o => 
        o.currentStatus === 'TAILORING' || o.currentStatus === 'PACKAGING'
      ).length
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

  } catch (error) {
    console.error("Error retrieving dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== TAILOR MANAGEMENT ==============

// Get Available Tailors
export const getAvailableTailors = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get validator
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator not found"
      });
    }

    const workshopId = validator[0].workshopId;

    // Get tailors
    const tailorsList = await db.select().from(tailors)
      .where(eq(tailors.workshopId, workshopId));

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

// ============== ITEM ASSIGNMENT ==============

// Assign Order Item to Tailor
export const assignItemToTailor = async (req, res) => {
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
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator not found"
      });
    }

    // Verify tailor belongs to same workshop
    const tailor = await db.select().from(tailors)
      .where(and(
        eq(tailors.id, parseInt(tailorId)),
        eq(tailors.workshopId, validator[0].workshopId)
      ))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tailor not found or not from this workshop"
      });
    }

    // Get order item
    const item = await db.select().from(orderItems)
      .where(eq(orderItems.id, parseInt(itemId)))
      .limit(1);

    if (item.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order item not found"
      });
    }

    // Use transaction
    const result = await db.transaction(async (tx) => {
      // Update order item
      const updated = await tx.update(orderItems)
        .set({
          tailorId: parseInt(tailorId),
          estimatedHours: parseInt(estimatedHours),
          assignedByValidatorId: validator[0].id,
          assignedAt: new Date(),
          itemStatus: 'ASSIGNED'
        })
        .where(eq(orderItems.id, parseInt(itemId)))
        .returning();

      // Log assignment
      await tx.insert(validatorAssignmentLog).values({
        validatorId: validator[0].id,
        tailorId: parseInt(tailorId),
        orderItemId: parseInt(itemId),
        estimatedHours: parseInt(estimatedHours),
        notes: notes || `Item assigned to ${tailor[0].fullName}`,
        assignedAt: new Date()
      });

      return updated[0];
    });

    return res.status(200).json({
      success: true,
      message: "Item assigned to tailor successfully",
      data: result
    });

  } catch (error) {
    console.error("Error assigning item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign item",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Assignments Made by Validator
export const getValidatorAssignments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get validator
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator not found"
      });
    }

    // Get assignments
    const assignments = await db.select().from(validatorAssignmentLog)
      .where(eq(validatorAssignmentLog.validatorId, validator[0].id))
      .orderBy('assignedAt', 'desc');

    return res.status(200).json({
      success: true,
      message: "Assignments retrieved successfully",
      data: {
        count: assignments.length,
        assignments: assignments
      }
    });

  } catch (error) {
    console.error("Error retrieving assignments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assignments",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== WORKLOAD MONITORING ==============

// Get Tailor Workload
export const getTailorWorkload = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tailorId } = req.params;

    // Get validator
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator not found"
      });
    }

    // Get tailor
    const tailor = await db.select().from(tailors)
      .where(and(
        eq(tailors.id, parseInt(tailorId)),
        eq(tailors.workshopId, validator[0].workshopId)
      ))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor not found"
      });
    }

    // Get assigned items
    const assignedItems = await db.select().from(orderItems)
      .where(eq(orderItems.tailorId, parseInt(tailorId)));

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

  } catch (error) {
    console.error("Error retrieving workload:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve workload",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== QUALITY CONTROL ==============

// Review Completed Item
export const reviewCompletedItem = async (req, res) => {
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
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator not found"
      });
    }

    // Get item
    const item = await db.select().from(orderItems)
      .where(eq(orderItems.id, parseInt(itemId)))
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
    const result = await db.transaction(async (tx) => {
      const newStatus = approved ? 'APPROVED' : 'REVISION_NEEDED';

      const updated = await tx.update(orderItems)
        .set({
          itemStatus: newStatus,
          reviewedAt: new Date()
        })
        .where(eq(orderItems.id, parseInt(itemId)))
        .returning();

      return updated[0];
    });

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

  } catch (error) {
    console.error("Error reviewing item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to review item",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== STATISTICS ==============

// Get Validator Statistics
export const getValidatorStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get validator
    const validator = await db.select().from(validators)
      .where(eq(validators.userId, userId))
      .limit(1);

    if (validator.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Validator not found"
      });
    }

    const workshopId = validator[0].workshopId;

    // Get all data
    const [assignments, orders, tailors] = await Promise.all([
      db.select().from(validatorAssignmentLog)
        .where(eq(validatorAssignmentLog.validatorId, validator[0].id)),
      db.select().from(orders)
        .where(eq(orders.workshopId, workshopId)),
      db.select().from(tailors)
        .where(eq(tailors.workshopId, workshopId))
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

  } catch (error) {
    console.error("Error getting statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
