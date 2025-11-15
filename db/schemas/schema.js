import { pgTable, serial, varchar, text, decimal, timestamp, boolean, pgEnum, integer, foreignKey, uniqueIndex, check, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// ============================================================================
// SCHEMA FIXES APPLIED
// ============================================================================
//
// 1. ✅ Changed all foreign keys from serial() to integer()
//    - serial() forced NOT NULL automatically
//    - integer() allows NULL properly
//
// 2. ✅ Changed optional FKs to integer()
//    - subscriptionPlanId (workshops)
//    - validatorId (orders) - optional
//    - tailorId (orderItems) - optional
//
// 3. ✅ Fixed .onDelete() behavior
//    - Use 'cascade' for required relationships
//    - Use 'set null' for optional FKs
//    - Use 'restrict' when needed
//
// ============================================================================

// Enums
export const userTypeEnum = pgEnum('user_type', ['WORKSHOP_OWNER', 'MAGAZINE_OWNER', 'TAILOR', 'VALIDATOR']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'VALIDATED', 'TAILORING', 'PACKAGING', 'COMPLETED']);
export const itemStatusEnum = pgEnum('item_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED']);

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pgTable("users", {
  id: serial().primaryKey().notNull(),
  username: varchar({ length: 50 }).notNull(),
  salt: varchar({ length: 255 }),
  refreshtoken: varchar({ length: 255 }),
  creationdate: timestamp({ withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updationdate: timestamp({ withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  avatar: varchar({ length: 255 }),
  email: varchar({ length: 100 }).notNull(),
  firstname: varchar({ length: 50 }),
  lastname: varchar({ length: 50 }),
  phone: varchar({ length: 20 }),
  userType: userTypeEnum('user_type').notNull(),
  passwordHash: varchar({ length: 255 }).notNull(),
}, (table) => [
  unique("users_username_key").on(table.username),
  unique("users_refreshtoken_key").on(table.refreshtoken),
  unique("users_email_key").on(table.email),
  check("users_email_check", sql`(email)::text ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'::text`),
  check("users_username_check", sql`(length((username)::text) > 3) AND ((username)::text ~ '^[a-zA-Z0-9_]+$'::text)`),
]);

// ============================================================================
// SUBSCRIPTION PLANS TABLE
// ============================================================================
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial().primaryKey().notNull(),
  planName: varchar('plan_name', { length: 100 }).notNull(),
  maxMagazines: integer('max_magazines').notNull(),
  maxTailors: integer('max_tailors').notNull(),
  maxValidators: integer('max_validators').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  features: text('features'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  unique("subscription_plans_plan_name_key").on(table.planName),
]);

// ============================================================================
// WORKSHOPS TABLE - FIXED
// ============================================================================
export const workshops = pgTable('workshops', {
  id: serial().primaryKey().notNull(),
  ownerUserId: integer('owner_user_id').notNull(), // ✅ Changed to integer
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: varchar('address', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  commissionPercentage: decimal('commission_percentage', { precision: 5, scale: 2 }),
  subscriptionPlanId: integer('subscription_plan_id'), // ✅ Changed to integer (optional)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.ownerUserId],
    foreignColumns: [users.id],
    name: "workshops_owner_user_id_fk"
  }).onDelete('cascade'), // ✅ Owner delete = workshop delete
  foreignKey({
    columns: [table.subscriptionPlanId],
    foreignColumns: [subscriptionPlans.id],
    name: "workshops_subscription_plan_id_fk"
  }).onDelete('set null'), // ✅ Plan delete = subscriptionPlanId = NULL
]);

// ============================================================================
// SUBSCRIPTIONS TABLE - FIXED
// ============================================================================
export const subscriptions = pgTable('subscriptions', {
  id: serial().primaryKey().notNull(),
  workshopId: integer('workshop_id').notNull(), // ✅ Changed to integer
  planType: varchar('plan_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date').notNull(),
  renewalDate: timestamp('renewal_date').notNull(),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending').notNull(),
  transactionId: varchar('transaction_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.workshopId],
    foreignColumns: [workshops.id],
    name: "subscriptions_workshop_id_fk"
  }).onDelete('cascade'), // ✅ Workshop delete = subscription delete
]);

// ============================================================================
// MAGAZINES TABLE - FIXED
// ============================================================================
export const magazines = pgTable('magazines', {
  id: serial().primaryKey().notNull(),
  ownerUserId: integer('owner_user_id').notNull(), // ✅ Changed to integer
  workshopId: integer('workshop_id').notNull(), // ✅ Changed to integer
  shopName: varchar('shop_name', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.ownerUserId],
    foreignColumns: [users.id],
    name: "magazines_owner_user_id_fk"
  }).onDelete('cascade'), // ✅ Owner delete = magazine delete
  foreignKey({
    columns: [table.workshopId],
    foreignColumns: [workshops.id],
    name: "magazines_workshop_id_fk"
  }).onDelete('cascade'), // ✅ Workshop delete = magazine delete
]);

// ============================================================================
// REFERRAL LINKS TABLE - FIXED
// ============================================================================
export const referralLinks = pgTable('referral_links', {
  id: serial().primaryKey().notNull(),
  workshopId: integer('workshop_id').notNull(), // ✅ Changed to integer
  token: varchar('token', { length: 255 }).notNull(),
  referralType: varchar('referral_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => [
  unique("referral_links_token_key").on(table.token),
  uniqueIndex('referral_links_token_idx').on(table.token),
  foreignKey({
    columns: [table.workshopId],
    foreignColumns: [workshops.id],
    name: "referral_links_workshop_id_fk"
  }).onDelete('cascade'), // ✅ Workshop delete = referral link delete
]);

// ============================================================================
// TAILORS TABLE - FIXED
// ============================================================================
export const tailors = pgTable('tailors', {
  id: serial().primaryKey().notNull(),
  userId: integer('user_id').notNull(), // ✅ Changed to integer
  workshopId: integer('workshop_id').notNull(), // ✅ Changed to integer
  fullName: varchar('full_name', { length: 255 }).notNull(),
  description: text('description'),
  skills: text('skills'),
  availabilityStatus: varchar('availability_status', { length: 50 }).default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "tailors_user_id_fk"
  }).onDelete('cascade'), // ✅ User delete = tailor delete
  foreignKey({
    columns: [table.workshopId],
    foreignColumns: [workshops.id],
    name: "tailors_workshop_id_fk"
  }).onDelete('cascade'), // ✅ Workshop delete = tailor delete
]);

// ============================================================================
// VALIDATORS TABLE - FIXED
// ============================================================================
export const validators = pgTable('validators', {
  id: serial().primaryKey().notNull(),
  userId: integer('user_id').notNull(), // ✅ Changed to integer
  workshopId: integer('workshop_id').notNull(), // ✅ Changed to integer
  fullName: varchar('full_name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "validators_user_id_fk"
  }).onDelete('cascade'), // ✅ User delete = validator delete
  foreignKey({
    columns: [table.workshopId],
    foreignColumns: [workshops.id],
    name: "validators_workshop_id_fk"
  }).onDelete('cascade'), // ✅ Workshop delete = validator delete
]);

// ============================================================================
// ORDERS TABLE - FIXED
// ============================================================================
export const orders = pgTable('orders', {
  id: serial().primaryKey().notNull(),
  magazineId: integer('magazine_id').notNull(), // ✅ Changed to integer
  workshopId: integer('workshop_id').notNull(), // ✅ Changed to integer
  validatorId: integer('validator_id'), // ✅ Changed to integer (optional)
  orderNumber: varchar('order_number', { length: 100 }).notNull(),
  description: text('description'),
  estimatedCompletionDate: timestamp('estimated_completion_date'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  currentStatus: orderStatusEnum('current_status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  unique("orders_order_number_key").on(table.orderNumber),
  uniqueIndex('orders_order_number_idx').on(table.orderNumber),
  foreignKey({
    columns: [table.magazineId],
    foreignColumns: [magazines.id],
    name: "orders_magazine_id_fk"
  }).onDelete('cascade'), // ✅ Magazine delete = order delete
  foreignKey({
    columns: [table.workshopId],
    foreignColumns: [workshops.id],
    name: "orders_workshop_id_fk"
  }).onDelete('cascade'), // ✅ Workshop delete = order delete
  foreignKey({
    columns: [table.validatorId],
    foreignColumns: [validators.id],
    name: "orders_validator_id_fk"
  }).onDelete('set null'), // ✅ Validator delete = validatorId = NULL (optional)
]);

// ============================================================================
// ORDER ITEMS TABLE - FIXED
// ============================================================================
export const orderItems = pgTable('order_items', {
  id: serial().primaryKey().notNull(),
  orderId: integer('order_id').notNull(), // ✅ Changed to integer
  tailorId: integer('tailor_id'), // ✅ Changed to integer (optional - not assigned yet)
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  itemStatus: itemStatusEnum('item_status').default('PENDING').notNull(),
  completionDate: timestamp('completion_date'),
  estimatedHours: integer('estimated_hours'),
  assignedByValidatorId: integer('assigned_by_validator_id'), // ✅ Changed to integer (optional)
  assignedAt: timestamp('assigned_at'),
}, (table) => [
  foreignKey({
    columns: [table.orderId],
    foreignColumns: [orders.id],
    name: "order_items_order_id_fk"
  }).onDelete('cascade'), // ✅ Order delete = item delete
  foreignKey({
    columns: [table.tailorId],
    foreignColumns: [tailors.id],
    name: "order_items_tailor_id_fk"
  }).onDelete('set null'), // ✅ Tailor delete = tailorId = NULL
  foreignKey({
    columns: [table.assignedByValidatorId],
    foreignColumns: [validators.id],
    name: "order_items_assigned_by_validator_id_fk"
  }).onDelete('set null'), // ✅ Validator delete = validatorId = NULL
]);

// ============================================================================
// ORDER TRACKING TABLE - FIXED
// ============================================================================
export const orderTracking = pgTable('order_tracking', {
  id: serial().primaryKey().notNull(),
  orderId: integer('order_id').notNull(), // ✅ Changed to integer
  previousStatus: varchar('previous_status', { length: 100 }),
  newStatus: varchar('new_status', { length: 100 }).notNull(),
  validatorId: integer('validator_id'), // ✅ Changed to integer (optional)
  description: text('description'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.orderId],
    foreignColumns: [orders.id],
    name: "order_tracking_order_id_fk"
  }).onDelete('cascade'), // ✅ Order delete = tracking delete
  foreignKey({
    columns: [table.validatorId],
    foreignColumns: [validators.id],
    name: "order_tracking_validator_id_fk"
  }).onDelete('set null'), // ✅ Validator delete = validatorId = NULL
]);

// ============================================================================
// VALIDATOR ASSIGNMENT LOG TABLE - FIXED
// ============================================================================
export const validatorAssignmentLog = pgTable('validator_assignment_log', {
  id: serial().primaryKey().notNull(),
  orderItemId: integer('order_item_id').notNull(), // ✅ Changed to integer
  validatorId: integer('validator_id').notNull(), // ✅ Changed to integer
  tailorId: integer('tailor_id').notNull(), // ✅ Changed to integer
  assignmentReason: text('assignment_reason'),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.orderItemId],
    foreignColumns: [orderItems.id],
    name: "validator_assignment_log_order_item_id_fk"
  }).onDelete('cascade'), // ✅ Item delete = log delete
  foreignKey({
    columns: [table.validatorId],
    foreignColumns: [validators.id],
    name: "validator_assignment_log_validator_id_fk"
  }).onDelete('cascade'), // ✅ Validator delete = log delete
  foreignKey({
    columns: [table.tailorId],
    foreignColumns: [tailors.id],
    name: "validator_assignment_log_tailor_id_fk"
  }).onDelete('cascade'), // ✅ Tailor delete = log delete
]);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  workshop: one(workshops, {
    fields: [users.id],
    references: [workshops.ownerUserId],
  }),
  magazine: one(magazines, {
    fields: [users.id],
    references: [magazines.ownerUserId],
  }),
  tailor: one(tailors, {
    fields: [users.id],
    references: [tailors.userId],
  }),
  validator: one(validators, {
    fields: [users.id],
    references: [validators.userId],
  }),
}));

export const workshopRelations = relations(workshops, ({ one, many }) => ({
  owner: one(users, {
    fields: [workshops.ownerUserId],
    references: [users.id],
  }),
  subscriptionPlan: one(subscriptionPlans, {
    fields: [workshops.subscriptionPlanId],
    references: [subscriptionPlans.id],
  }),
  referralLinks: many(referralLinks),
  tailors: many(tailors),
  validators: many(validators),
  magazines: many(magazines),
  orders: many(orders),
  subscriptions: many(subscriptions),
}));

export const subscriptionPlanRelations = relations(subscriptionPlans, ({ many }) => ({
  workshops: many(workshops),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  workshop: one(workshops, {
    fields: [subscriptions.workshopId],
    references: [workshops.id],
  }),
}));

export const magazineRelations = relations(magazines, ({ one, many }) => ({
  owner: one(users, {
    fields: [magazines.ownerUserId],
    references: [users.id],
  }),
  workshop: one(workshops, {
    fields: [magazines.workshopId],
    references: [workshops.id],
  }),
  orders: many(orders),
}));

export const referralLinkRelations = relations(referralLinks, ({ one }) => ({
  workshop: one(workshops, {
    fields: [referralLinks.workshopId],
    references: [workshops.id],
  }),
}));

export const tailorRelations = relations(tailors, ({ one, many }) => ({
  user: one(users, {
    fields: [tailors.userId],
    references: [users.id],
  }),
  workshop: one(workshops, {
    fields: [tailors.workshopId],
    references: [workshops.id],
  }),
  orderItems: many(orderItems),
  validatorAssignmentLogs: many(validatorAssignmentLog),
}));

export const validatorRelations = relations(validators, ({ one, many }) => ({
  user: one(users, {
    fields: [validators.userId],
    references: [users.id],
  }),
  workshop: one(workshops, {
    fields: [validators.workshopId],
    references: [workshops.id],
  }),
  orders: many(orders),
  assignedOrderItems: many(orderItems),
  orderTrackingUpdates: many(orderTracking),
  assignmentLogs: many(validatorAssignmentLog),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  magazine: one(magazines, {
    fields: [orders.magazineId],
    references: [magazines.id],
  }),
  workshop: one(workshops, {
    fields: [orders.workshopId],
    references: [workshops.id],
  }),
  validator: one(validators, {
    fields: [orders.validatorId],
    references: [validators.id],
  }),
  orderItems: many(orderItems),
  orderTracking: many(orderTracking),
}));

export const orderItemRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  tailor: one(tailors, {
    fields: [orderItems.tailorId],
    references: [tailors.id],
  }),
  assignedByValidator: one(validators, {
    fields: [orderItems.assignedByValidatorId],
    references: [validators.id],
  }),
  assignmentLogs: many(validatorAssignmentLog),
}));

export const orderTrackingRelations = relations(orderTracking, ({ one }) => ({
  order: one(orders, {
    fields: [orderTracking.orderId],
    references: [orders.id],
  }),
  validator: one(validators, {
    fields: [orderTracking.validatorId],
    references: [validators.id],
  }),
}));

export const validatorAssignmentLogRelations = relations(validatorAssignmentLog, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [validatorAssignmentLog.orderItemId],
    references: [orderItems.id],
  }),
  validator: one(validators, {
    fields: [validatorAssignmentLog.validatorId],
    references: [validators.id],
  }),
  tailor: one(tailors, {
    fields: [validatorAssignmentLog.tailorId],
    references: [tailors.id],
  }),
}));
