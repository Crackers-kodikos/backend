import { magazines, users, workshops, orders, orderItems, validators } from '../db/schemas/schema.js';
import { eq, and, count } from 'drizzle-orm';
import db from "../db/index.js";
import { config } from "../config/env.js";

// ============== MAGAZINE PROFILE ==============

// Get Magazine Profile
export const getMagazineProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get magazine owned by this user
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
      .limit(1);

    if (magazine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Magazine/Shop not found"
      });
    }

    const magazineData = magazine[0];

    // Get workshop details
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.id, magazineData.workshopId))
      .limit(1);

    return res.status(200).json({
      success: true,
      message: "Magazine profile retrieved successfully",
      data: {
        magazine: magazineData,
        workshop: workshop.length > 0 ? workshop[0] : null
      }
    });

  } catch (error) {
    console.error("Error retrieving magazine profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve magazine profile",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Magazine Profile
export const updateMagazineProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shopName, address, phone } = req.body;

    // Get magazine
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
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
    if (shopName) updateData.shopName = shopName;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length === 1) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    const updated = await db.update(magazines)
      .set(updateData)
      .where(eq(magazines.id, magazineId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Magazine profile updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating magazine profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update magazine profile",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== MAGAZINE DASHBOARD ==============

// Get Magazine Dashboard
export const getMagazineDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get magazine
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
      .limit(1);

    if (magazine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Magazine/Shop not found"
      });
    }

    const magazineId = magazine[0].id;

    // Get order counts and statistics
    const [totalOrdersResult, recentOrdersResult] = await Promise.all([
      db.select({ count: count() }).from(orders)
        .where(eq(orders.magazineId, magazineId)),
      db.select().from(orders)
        .where(eq(orders.magazineId, magazineId))
        .orderBy('createdAt', 'desc')
        .limit(5)
    ]);

    // Calculate order statistics
    const allOrders = await db.select().from(orders)
      .where(eq(orders.magazineId, magazineId));

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

  } catch (error) {
    console.error("Error retrieving magazine dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve magazine dashboard",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== WORKSHOP DISCOVERY ==============

// Get Available Workshops
export const getAvailableWorkshops = async (req, res) => {
  try {
    const { search } = req.query;

    // Get all workshops
    let query = db.select().from(workshops);

    if (search) {
      // Add simple search if needed
      // For now, we'll get all
    }

    const workshopsList = await query;

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

  } catch (error) {
    console.error("Error retrieving workshops:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve workshops",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== ORDER MANAGEMENT ==============

// Create New Order
export const createOrder = async (req, res) => {
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
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
      .limit(1);

    if (magazine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Magazine/Shop not found"
      });
    }

    // Verify workshop exists
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.id, parseInt(workshopId)))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get a validator from the workshop (first available)
    const validator = await db.select().from(validators)
      .where(eq(validators.workshopId, parseInt(workshopId)))
      .limit(1);

    if (validator.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Workshop has no validators to assign to this order"
      });
    }

    // Create order using transaction
    const result = await db.transaction(async (tx) => {
      // Check if order number already exists
      const existing = await tx.select().from(orders)
        .where(eq(orders.orderNumber, orderNumber))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Order number already exists");
      }

      // Create order
      const newOrder = await tx.insert(orders).values({
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
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: result
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get All Orders for Magazine
export const getMagazineOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Get magazine
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
      .limit(1);

    if (magazine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Magazine/Shop not found"
      });
    }

    // Get orders
    let query = db.select().from(orders)
      .where(eq(orders.magazineId, magazine[0].id))
      .orderBy('createdAt', 'desc');

    if (status && ['PENDING', 'VALIDATED', 'TAILORING', 'PACKAGING', 'COMPLETED'].includes(status)) {
      query = query.where(eq(orders.currentStatus, status));
    }

    const ordersList = await query;

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        count: ordersList.length,
        orders: ordersList
      }
    });

  } catch (error) {
    console.error("Error retrieving orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Single Order Details
export const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Get magazine
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
      .limit(1);

    if (magazine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Magazine/Shop not found"
      });
    }

    // Get order
    const order = await db.select().from(orders)
      .where(and(
        eq(orders.id, parseInt(orderId)),
        eq(orders.magazineId, magazine[0].id)
      ))
      .limit(1);

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Get order items
    const items = await db.select().from(orderItems)
      .where(eq(orderItems.orderId, parseInt(orderId)));

    return res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      data: {
        order: order[0],
        items: items
      }
    });

  } catch (error) {
    console.error("Error retrieving order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update Order (only if PENDING)
export const updateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { description, estimatedCompletionDate, totalPrice } = req.body;

    // Get magazine
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
      .limit(1);

    if (magazine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Magazine/Shop not found"
      });
    }

    // Get order
    const order = await db.select().from(orders)
      .where(and(
        eq(orders.id, parseInt(orderId)),
        eq(orders.magazineId, magazine[0].id)
      ))
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
    if (description) updateData.description = description;
    if (estimatedCompletionDate) updateData.estimatedCompletionDate = new Date(estimatedCompletionDate);
    if (totalPrice) updateData.totalPrice = parseFloat(totalPrice);
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length === 1) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    const updated = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, parseInt(orderId)))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Cancel Order (only if PENDING)
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Get magazine
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
      .limit(1);

    if (magazine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Magazine/Shop not found"
      });
    }

    // Get order
    const order = await db.select().from(orders)
      .where(and(
        eq(orders.id, parseInt(orderId)),
        eq(orders.magazineId, magazine[0].id)
      ))
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
    await db.delete(orders).where(eq(orders.id, parseInt(orderId)));

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
