import { tailors, users, workshops, orderItems, orders } from '../db/schemas/schema.js';
import { eq, and, count } from 'drizzle-orm';
import db from "../db/index.js";
import { config } from "../config/env.js";

// ============== TAILOR PROFILE ==============

export const getTailorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const tailor = await db.select().from(tailors)
      .where(eq(tailors.userId, userId))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor profile not found"
      });
    }

    const workshop = await db.select().from(workshops)
      .where(eq(workshops.id, tailor[0].workshopId))
      .limit(1);

    return res.status(200).json({
      success: true,
      message: "Tailor profile retrieved successfully",
      data: {
        tailor: tailor[0],
        workshop: workshop.length > 0 ? workshop[0] : null
      }
    });

  } catch (error) {
    console.error("Error retrieving tailor profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tailor profile",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateTailorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, description, skills, availabilityStatus } = req.body;

    const tailor = await db.select().from(tailors)
      .where(eq(tailors.userId, userId))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor profile not found"
      });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
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
      .where(eq(tailors.id, tailor[0].id))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Tailor profile updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating tailor profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update tailor profile",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== TAILOR DASHBOARD ==============

export const getTailorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const tailor = await db.select().from(tailors)
      .where(eq(tailors.userId, userId))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor not found"
      });
    }

    const assignedItems = await db.select().from(orderItems)
      .where(eq(orderItems.tailorId, tailor[0].id));

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

  } catch (error) {
    console.error("Error retrieving dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== ASSIGNED TASKS ==============

export const getAssignedTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const tailor = await db.select().from(tailors)
      .where(eq(tailors.userId, userId))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor not found"
      });
    }

    let query = db.select().from(orderItems)
      .where(eq(orderItems.tailorId, tailor[0].id))
      .orderBy('assignedAt', 'desc');

    if (status && ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      query = query.where(eq(orderItems.itemStatus, status));
    }

    const items = await query;

    return res.status(200).json({
      success: true,
      message: "Assigned tasks retrieved successfully",
      data: {
        count: items.length,
        items: items
      }
    });

  } catch (error) {
    console.error("Error retrieving tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getTaskDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const tailor = await db.select().from(tailors)
      .where(eq(tailors.userId, userId))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor not found"
      });
    }

    const item = await db.select().from(orderItems)
      .where(and(
        eq(orderItems.id, parseInt(itemId)),
        eq(orderItems.tailorId, tailor[0].id)
      ))
      .limit(1);

    if (item.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const order = await db.select().from(orders)
      .where(eq(orders.id, item[0].orderId))
      .limit(1);

    return res.status(200).json({
      success: true,
      message: "Task details retrieved successfully",
      data: {
        item: item[0],
        order: order.length > 0 ? order[0] : null
      }
    });

  } catch (error) {
    console.error("Error retrieving task:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve task",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== TASK MANAGEMENT ==============

export const updateTaskStatus = async (req, res) => {
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

    const tailor = await db.select().from(tailors)
      .where(eq(tailors.userId, userId))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor not found"
      });
    }

    const item = await db.select().from(orderItems)
      .where(and(
        eq(orderItems.id, parseInt(itemId)),
        eq(orderItems.tailorId, tailor[0].id)
      ))
      .limit(1);

    if (item.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const updated = await db.update(orderItems)
      .set({
        itemStatus: newStatus,
        updatedAt: new Date()
      })
      .where(eq(orderItems.id, parseInt(itemId)))
      .returning();

    return res.status(200).json({
      success: true,
      message: `Task status updated to ${newStatus}`,
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== STATISTICS ==============

export const getTailorStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const tailor = await db.select().from(tailors)
      .where(eq(tailors.userId, userId))
      .limit(1);

    if (tailor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tailor not found"
      });
    }

    const allItems = await db.select().from(orderItems)
      .where(eq(orderItems.tailorId, tailor[0].id));

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

  } catch (error) {
    console.error("Error getting statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
