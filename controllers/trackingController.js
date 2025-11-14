import { orderTracking, orders, magazines, validators } from '../db/schemas/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import db from "../db/index.js";
import { config } from "../config/env.js";

// ============== ORDER TRACKING ==============

// Get Order Tracking History
export const getOrderTrackingHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify order exists
    const order = await db.select().from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .limit(1);

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Get tracking history
    const tracking = await db.select().from(orderTracking)
      .where(eq(orderTracking.orderId, parseInt(orderId)))
      .orderBy(desc(orderTracking.timestamp));

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

  } catch (error) {
    console.error("Error retrieving tracking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tracking history",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Magazine Orders Tracking
export const getMagazineOrdersTracking = async (req, res) => {
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
        message: "Magazine not found"
      });
    }

    // Get orders
    let query = db.select().from(orders)
      .where(eq(orders.magazineId, magazine[0].id))
      .orderBy(desc(orders.createdAt));

    if (status && ['PENDING', 'VALIDATED', 'TAILORING', 'PACKAGING', 'COMPLETED'].includes(status)) {
      query = query.where(eq(orders.currentStatus, status));
    }

    const ordersList = await query;

    // Get tracking for each order
    const ordersWithTracking = await Promise.all(
      ordersList.map(async (order) => {
        const tracking = await db.select().from(orderTracking)
          .where(eq(orderTracking.orderId, order.id))
          .orderBy(desc(orderTracking.timestamp))
          .limit(5); // Last 5 events

        return {
          ...order,
          lastEvents: tracking
        };
      })
    );

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

  } catch (error) {
    console.error("Error retrieving magazine tracking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve magazine tracking",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Recent Tracking Events
export const getRecentTrackingEvents = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const events = await db.select().from(orderTracking)
      .orderBy(desc(orderTracking.timestamp))
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Recent tracking events retrieved successfully",
      data: {
        count: events.length,
        events: events
      }
    });

  } catch (error) {
    console.error("Error retrieving events:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tracking events",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== ORDER STATUS SUMMARY ==============

// Get Order Status Summary
export const getOrderStatusSummary = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order
    const order = await db.select().from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .limit(1);

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Get tracking
    const tracking = await db.select().from(orderTracking)
      .where(eq(orderTracking.orderId, parseInt(orderId)))
      .orderBy(desc(orderTracking.timestamp));

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

  } catch (error) {
    console.error("Error retrieving summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve status summary",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== MAGAZINE TRACKING DASHBOARD ==============

// Get Magazine Tracking Dashboard
export const getMagazineTrackingDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get magazine
    const magazine = await db.select().from(magazines)
      .where(eq(magazines.ownerUserId, userId))
      .limit(1);

    if (magazine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Magazine not found"
      });
    }

    // Get orders
    const allOrders = await db.select().from(orders)
      .where(eq(orders.magazineId, magazine[0].id));

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

  } catch (error) {
    console.error("Error retrieving dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== TRACKING STATISTICS ==============

// Get Tracking Statistics by Status
export const getTrackingStatisticsByStatus = async (req, res) => {
  try {
    const allOrders = await db.select().from(orders);

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

  } catch (error) {
    console.error("Error retrieving statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve statistics",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Average Order Processing Time
export const getAverageProcessingTime = async (req, res) => {
  try {
    const completedOrders = await db.select().from(orders)
      .where(eq(orders.currentStatus, 'COMPLETED'));

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

    const averageTime = Math.round(
      processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
    );

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

  } catch (error) {
    console.error("Error calculating processing time:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate processing time",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== EXPORT TRACKING DATA ==============

// Export Order Tracking Report
export const exportOrderTrackingReport = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await db.select().from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .limit(1);

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const tracking = await db.select().from(orderTracking)
      .where(eq(orderTracking.orderId, parseInt(orderId)))
      .orderBy(desc(orderTracking.timestamp));

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

  } catch (error) {
    console.error("Error generating report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
