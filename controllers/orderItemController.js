// ============================================================
// FIXED: orderItemController.js
// ============================================================
// All incorrect status enums have been replaced
// REMOVED: 'ASSIGNED', 'APPROVED', 'REVISION_NEEDED'
// KEPT ONLY: 'PENDING', 'IN_PROGRESS', 'COMPLETED'
// ============================================================

import { orderItems, orders, tailors, validators, magazines } from '../db/schemas/schema.js';

import { eq, and, count } from 'drizzle-orm';

import db from "../db/index.js";

import { config } from "../config/env.js";

// ============== ORDER ITEM RETRIEVAL ==============

// Get All Order Items
export const getOrderItems = async (req, res) => {
try {
const { orderId, status, tailorId } = req.query;

let query = db.select().from(orderItems);

if (orderId) {
query = query.where(eq(orderItems.orderId, parseInt(orderId)));
}

// ✅ FIX #1: Line 15 - REPLACE invalid statuses
if (status && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
query = query.where(eq(orderItems.itemStatus, status));
}

if (tailorId) {
query = query.where(eq(orderItems.tailorId, parseInt(tailorId)));
}

const items = await query;

return res.status(200).json({
success: true,
message: "Order items retrieved successfully",
data: {
count: items.length,
items: items
}
});

} catch (error) {
console.error("Error retrieving order items:", error);
return res.status(500).json({
success: false,
message: "Failed to retrieve order items",
error: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
}
};

// Get Single Order Item Details
export const getOrderItemDetails = async (req, res) => {
try {
const { itemId } = req.params;

const item = await db.select().from(orderItems)
.where(eq(orderItems.id, parseInt(itemId)))
.limit(1);

if (item.length === 0) {
return res.status(404).json({
success: false,
message: "Order item not found"
});
}

// Get related data
const [order, tailor, validator] = await Promise.all([
db.select().from(orders).where(eq(orders.id, item[0].orderId)),
item[0].tailorId ? db.select().from(tailors).where(eq(tailors.id, item[0].tailorId)) : Promise.resolve([]),
item[0].assignedByValidatorId ? db.select().from(validators).where(eq(validators.id, item[0].assignedByValidatorId)) : Promise.resolve([])
]);

return res.status(200).json({
success: true,
message: "Order item details retrieved successfully",
data: {
item: item[0],
order: order.length > 0 ? order[0] : null,
tailor: tailor.length > 0 ? tailor[0] : null,
validator: validator.length > 0 ? validator[0] : null
}
});

} catch (error) {
console.error("Error retrieving order item:", error);
return res.status(500).json({
success: false,
message: "Failed to retrieve order item",
error: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
}
};

// Get Items by Order
export const getOrderItemsByOrder = async (req, res) => {
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

// Get items
const items = await db.select().from(orderItems)
.where(eq(orderItems.orderId, parseInt(orderId)));

// ✅ FIX #2: Lines 79-86 - REPLACE stats with only valid statuses
const stats = {
totalItems: items.length,
pending: items.filter(i => i.itemStatus === 'PENDING').length,
inProgress: items.filter(i => i.itemStatus === 'IN_PROGRESS').length,
completed: items.filter(i => i.itemStatus === 'COMPLETED').length
};

return res.status(200).json({
success: true,
message: "Order items retrieved successfully",
data: {
orderId: order[0].id,
orderNumber: order[0].orderNumber,
stats: stats,
items: items
}
});

} catch (error) {
console.error("Error retrieving order items:", error);
return res.status(500).json({
success: false,
message: "Failed to retrieve order items",
error: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
}
};

// Get Items by Tailor
export const getOrderItemsByTailor = async (req, res) => {
try {
const { tailorId } = req.params;

// Verify tailor exists
const tailor = await db.select().from(tailors)
.where(eq(tailors.id, parseInt(tailorId)))
.limit(1);

if (tailor.length === 0) {
return res.status(404).json({
success: false,
message: "Tailor not found"
});
}

// Get items
const items = await db.select().from(orderItems)
.where(eq(orderItems.tailorId, parseInt(tailorId)));

return res.status(200).json({
success: true,
message: "Tailor items retrieved successfully",
data: {
tailorId: tailor[0].id,
tailorName: tailor[0].fullName,
count: items.length,
items: items
}
});

} catch (error) {
console.error("Error retrieving tailor items:", error);
return res.status(500).json({
success: false,
message: "Failed to retrieve tailor items",
error: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
}
};

// ============== ITEM STATUS MANAGEMENT ==============

// Update Item Status
export const updateItemStatus = async (req, res) => {
try {
const { itemId } = req.params;
const { newStatus, completionDate } = req.body;

// ✅ FIX #3: Line 135 - REPLACE with only valid statuses
const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

if (!newStatus || !validStatuses.includes(newStatus)) {
return res.status(400).json({
success: false,
message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
});
}

const item = await db.select().from(orderItems)
.where(eq(orderItems.id, parseInt(itemId)))
.limit(1);

if (item.length === 0) {
return res.status(404).json({
success: false,
message: "Order item not found"
});
}

const updateData = {
itemStatus: newStatus,
updatedAt: new Date()
};

if (completionDate && newStatus === 'COMPLETED') {
updateData.completionDate = new Date(completionDate);
}

const updated = await db.update(orderItems)
.set(updateData)
.where(eq(orderItems.id, parseInt(itemId)))
.returning();

return res.status(200).json({
success: true,
message: `Item status updated to ${newStatus}`,
data: updated[0]
});

} catch (error) {
console.error("Error updating item status:", error);
return res.status(500).json({
success: false,
message: "Failed to update item status",
error: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
}
};

// Update Multiple Items Status
export const updateMultipleItemsStatus = async (req, res) => {
try {
const { itemIds, newStatus } = req.body;

if (!Array.isArray(itemIds) || itemIds.length === 0) {
return res.status(400).json({
success: false,
message: "itemIds must be a non-empty array"
});
}

// ✅ FIX #4: Line 197 - REPLACE with only valid statuses
const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

if (!newStatus || !validStatuses.includes(newStatus)) {
return res.status(400).json({
success: false,
message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
});
}

// Update all items in transaction
const updated = await db.transaction(async (tx) => {
const results = [];
for (const itemId of itemIds) {
const result = await tx.update(orderItems)
.set({
itemStatus: newStatus,
updatedAt: new Date()
})
.where(eq(orderItems.id, parseInt(itemId)))
.returning();

if (result.length > 0) {
results.push(result[0]);
}
}
return results;
});

return res.status(200).json({
success: true,
message: `${updated.length} items updated to ${newStatus}`,
data: {
updatedCount: updated.length,
items: updated
}
});

} catch (error) {
console.error("Error updating multiple items:", error);
return res.status(500).json({
success: false,
message: "Failed to update multiple items",
error: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
}
};

// ============== ITEM ASSIGNMENT ==============

// Get Item Assignment Details
export const getItemAssignmentDetails = async (req, res) => {
try {
const { itemId } = req.params;

const item = await db.select().from(orderItems)
.where(eq(orderItems.id, parseInt(itemId)))
.limit(1);

if (item.length === 0) {
return res.status(404).json({
success: false,
message: "Order item not found"
});
}

const assignmentDetails = {
itemId: item[0].id,
status: item[0].itemStatus,
assignedAt: item[0].assignedAt,
estimatedHours: item[0].estimatedHours,
completionDate: item[0].completionDate,
tailor: null,
validator: null
};

if (item[0].tailorId) {
const tailor = await db.select().from(tailors)
.where(eq(tailors.id, item[0].tailorId))
.limit(1);

if (tailor.length > 0) {
assignmentDetails.tailor = tailor[0];
}
}

if (item[0].assignedByValidatorId) {
const validator = await db.select().from(validators)
.where(eq(validators.id, item[0].assignedByValidatorId))
.limit(1);

if (validator.length > 0) {
assignmentDetails.validator = validator[0];
}
}

return res.status(200).json({
success: true,
message: "Item assignment details retrieved",
data: assignmentDetails
});

} catch (error) {
console.error("Error retrieving assignment details:", error);
return res.status(500).json({
success: false,
message: "Failed to retrieve assignment details",
error: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
}
};

// ============== STATISTICS ==============

// Get Order Item Statistics
export const getOrderItemStatistics = async (req, res) => {
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

const items = await db.select().from(orderItems)
.where(eq(orderItems.orderId, parseInt(orderId)));

// ✅ FIX #5: Lines 257-266 - REPLACE stats with only valid statuses
const stats = {
totalItems: items.length,
statusBreakdown: {
pending: items.filter(i => i.itemStatus === 'PENDING').length,
inProgress: items.filter(i => i.itemStatus === 'IN_PROGRESS').length,
completed: items.filter(i => i.itemStatus === 'COMPLETED').length
},
totalEstimatedHours: items.reduce((sum, i) => sum + (i.estimatedHours || 0), 0),
completionPercentage: items.length > 0
? Math.round((items.filter(i => i.itemStatus === 'COMPLETED').length / items.length) * 100)
: 0
};

return res.status(200).json({
success: true,
message: "Order item statistics retrieved",
data: {
orderId: order[0].id,
orderNumber: order[0].orderNumber,
stats: stats
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

// Get Global Item Statistics
export const getGlobalItemStatistics = async (req, res) => {
try {
const allItems = await db.select().from(orderItems);

// ✅ FIX #6: Lines 303-312 - REPLACE stats with only valid statuses
const stats = {
totalItems: allItems.length,
byStatus: {
pending: allItems.filter(i => i.itemStatus === 'PENDING').length,
inProgress: allItems.filter(i => i.itemStatus === 'IN_PROGRESS').length,
completed: allItems.filter(i => i.itemStatus === 'COMPLETED').length
},
averageEstimatedHours: allItems.length > 0
? Math.round(allItems.reduce((sum, i) => sum + (i.estimatedHours || 0), 0) / allItems.length)
: 0
};

return res.status(200).json({
success: true,
message: "Global item statistics retrieved",
data: stats
});

} catch (error) {
console.error("Error retrieving global statistics:", error);
return res.status(500).json({
success: false,
message: "Failed to retrieve global statistics",
error: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
}
};