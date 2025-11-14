"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRelations = exports.subscriptionPlanRelations = exports.validatorAssignmentLogRelations = exports.orderTrackingRelations = exports.orderItemRelations = exports.orderRelations = exports.validatorRelations = exports.tailorRelations = exports.referralLinkRelations = exports.magazineRelations = exports.workshopRelations = exports.usersRelations = exports.validatorAssignmentLog = exports.orderTracking = exports.orderItems = exports.orders = exports.validators = exports.tailors = exports.referralLinks = exports.magazines = exports.subscriptions = exports.workshops = exports.subscriptionPlans = exports.users = exports.itemStatusEnum = exports.orderStatusEnum = exports.userTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_orm_2 = require("drizzle-orm");
// Enums
exports.userTypeEnum = (0, pg_core_1.pgEnum)('user_type', ['WORKSHOP_OWNER', 'MAGAZINE_OWNER', 'TAILOR', 'VALIDATOR']);
exports.orderStatusEnum = (0, pg_core_1.pgEnum)('order_status', ['PENDING', 'VALIDATED', 'TAILORING', 'PACKAGING', 'COMPLETED']);
exports.itemStatusEnum = (0, pg_core_1.pgEnum)('item_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED']);
// Tables
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    username: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    salt: (0, pg_core_1.varchar)({ length: 255 }),
    refreshtoken: (0, pg_core_1.varchar)({ length: 255 }),
    creationdate: (0, pg_core_1.timestamp)({ withTimezone: true, mode: 'date' }).default((0, drizzle_orm_2.sql) `CURRENT_TIMESTAMP`).notNull(),
    updationdate: (0, pg_core_1.timestamp)({ withTimezone: true, mode: 'date' }).default((0, drizzle_orm_2.sql) `CURRENT_TIMESTAMP`).notNull(),
    avatar: (0, pg_core_1.varchar)({ length: 255 }),
    email: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    firstname: (0, pg_core_1.varchar)({ length: 50 }),
    lastname: (0, pg_core_1.varchar)({ length: 50 }),
    phone: (0, pg_core_1.varchar)({ length: 20 }),
    userType: (0, exports.userTypeEnum)('user_type').notNull(),
    passwordHash: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
}, (table) => [
    (0, pg_core_1.unique)("users_username_key").on(table.username),
    (0, pg_core_1.unique)("users_refreshtoken_key").on(table.refreshtoken),
    (0, pg_core_1.unique)("users_email_key").on(table.email),
    (0, pg_core_1.check)("users_email_check", (0, drizzle_orm_2.sql) `(email)::text ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'::text`),
    (0, pg_core_1.check)("users_username_check", (0, drizzle_orm_2.sql) `(length((username)::text) > 3) AND ((username)::text ~ '^[a-zA-Z0-9_]+$'::text)`),
]);
exports.subscriptionPlans = (0, pg_core_1.pgTable)('subscription_plans', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    planName: (0, pg_core_1.varchar)('plan_name', { length: 100 }).notNull(),
    maxMagazines: (0, pg_core_1.integer)('max_magazines').notNull(),
    maxTailors: (0, pg_core_1.integer)('max_tailors').notNull(),
    maxValidators: (0, pg_core_1.integer)('max_validators').notNull(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    features: (0, pg_core_1.text)('features'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.unique)("subscription_plans_plan_name_key").on(table.planName),
]);
exports.workshops = (0, pg_core_1.pgTable)('workshops', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    ownerUserId: (0, pg_core_1.serial)('owner_user_id').notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    address: (0, pg_core_1.varchar)('address', { length: 255 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }),
    commissionPercentage: (0, pg_core_1.decimal)('commission_percentage', { precision: 5, scale: 2 }),
    subscriptionPlanId: (0, pg_core_1.serial)('subscription_plan_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.ownerUserId],
        foreignColumns: [exports.users.id],
        name: "workshops_owner_user_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.subscriptionPlanId],
        foreignColumns: [exports.subscriptionPlans.id],
        name: "workshops_subscription_plan_id_fk"
    }).onDelete('restrict'),
]);
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.serial)('workshop_id').notNull(),
    planType: (0, pg_core_1.varchar)('plan_type', { length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('active').notNull(),
    startDate: (0, pg_core_1.timestamp)('start_date').defaultNow().notNull(),
    endDate: (0, pg_core_1.timestamp)('end_date').notNull(),
    renewalDate: (0, pg_core_1.timestamp)('renewal_date').notNull(),
    paymentStatus: (0, pg_core_1.varchar)('payment_status', { length: 50 }).default('pending').notNull(),
    transactionId: (0, pg_core_1.varchar)('transaction_id', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "subscriptions_workshop_id_fk"
    }).onDelete('cascade'),
]);
exports.magazines = (0, pg_core_1.pgTable)('magazines', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    ownerUserId: (0, pg_core_1.serial)('owner_user_id').notNull(),
    workshopId: (0, pg_core_1.serial)('workshop_id').notNull(),
    shopName: (0, pg_core_1.varchar)('shop_name', { length: 255 }).notNull(),
    address: (0, pg_core_1.varchar)('address', { length: 255 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.ownerUserId],
        foreignColumns: [exports.users.id],
        name: "magazines_owner_user_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "magazines_workshop_id_fk"
    }).onDelete('cascade'),
]);
exports.referralLinks = (0, pg_core_1.pgTable)('referral_links', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.serial)('workshop_id').notNull(),
    token: (0, pg_core_1.varchar)('token', { length: 255 }).notNull(),
    referralType: (0, pg_core_1.varchar)('referral_type', { length: 50 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
}, (table) => [
    (0, pg_core_1.unique)("referral_links_token_key").on(table.token),
    (0, pg_core_1.uniqueIndex)('referral_links_token_idx').on(table.token),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "referral_links_workshop_id_fk"
    }).onDelete('cascade'),
]);
exports.tailors = (0, pg_core_1.pgTable)('tailors', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    userId: (0, pg_core_1.serial)('user_id').notNull(),
    workshopId: (0, pg_core_1.serial)('workshop_id').notNull(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    skills: (0, pg_core_1.text)('skills'),
    availabilityStatus: (0, pg_core_1.varchar)('availability_status', { length: 50 }).default('available').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [exports.users.id],
        name: "tailors_user_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "tailors_workshop_id_fk"
    }).onDelete('cascade'),
]);
exports.validators = (0, pg_core_1.pgTable)('validators', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    userId: (0, pg_core_1.serial)('user_id').notNull(),
    workshopId: (0, pg_core_1.serial)('workshop_id').notNull(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [exports.users.id],
        name: "validators_user_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "validators_workshop_id_fk"
    }).onDelete('cascade'),
]);
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    magazineId: (0, pg_core_1.serial)('magazine_id').notNull(),
    workshopId: (0, pg_core_1.serial)('workshop_id').notNull(),
    validatorId: (0, pg_core_1.serial)('validator_id').notNull(),
    orderNumber: (0, pg_core_1.varchar)('order_number', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    estimatedCompletionDate: (0, pg_core_1.timestamp)('estimated_completion_date'),
    totalPrice: (0, pg_core_1.decimal)('total_price', { precision: 10, scale: 2 }).notNull(),
    currentStatus: (0, exports.orderStatusEnum)('current_status').default('PENDING').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.unique)("orders_order_number_key").on(table.orderNumber),
    (0, pg_core_1.uniqueIndex)('orders_order_number_idx').on(table.orderNumber),
    (0, pg_core_1.foreignKey)({
        columns: [table.magazineId],
        foreignColumns: [exports.magazines.id],
        name: "orders_magazine_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "orders_workshop_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.validatorId],
        foreignColumns: [exports.validators.id],
        name: "orders_validator_id_fk"
    }).onDelete('restrict'),
]);
exports.orderItems = (0, pg_core_1.pgTable)('order_items', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    orderId: (0, pg_core_1.serial)('order_id').notNull(),
    tailorId: (0, pg_core_1.serial)('tailor_id').notNull(),
    imageUrl: (0, pg_core_1.varchar)('image_url', { length: 500 }),
    itemStatus: (0, exports.itemStatusEnum)('item_status').default('PENDING').notNull(),
    completionDate: (0, pg_core_1.timestamp)('completion_date'),
    estimatedHours: (0, pg_core_1.integer)('estimated_hours'),
    assignedByValidatorId: (0, pg_core_1.serial)('assigned_by_validator_id').notNull(),
    assignedAt: (0, pg_core_1.timestamp)('assigned_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.orderId],
        foreignColumns: [exports.orders.id],
        name: "order_items_order_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.tailorId],
        foreignColumns: [exports.tailors.id],
        name: "order_items_tailor_id_fk"
    }).onDelete('restrict'),
    (0, pg_core_1.foreignKey)({
        columns: [table.assignedByValidatorId],
        foreignColumns: [exports.validators.id],
        name: "order_items_assigned_by_validator_id_fk"
    }).onDelete('restrict'),
]);
exports.orderTracking = (0, pg_core_1.pgTable)('order_tracking', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    orderId: (0, pg_core_1.serial)('order_id').notNull(),
    previousStatus: (0, pg_core_1.varchar)('previous_status', { length: 100 }),
    newStatus: (0, pg_core_1.varchar)('new_status', { length: 100 }).notNull(),
    validatorId: (0, pg_core_1.serial)('validator_id').notNull(),
    description: (0, pg_core_1.text)('description'),
    timestamp: (0, pg_core_1.timestamp)('timestamp').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.orderId],
        foreignColumns: [exports.orders.id],
        name: "order_tracking_order_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.validatorId],
        foreignColumns: [exports.validators.id],
        name: "order_tracking_validator_id_fk"
    }).onDelete('restrict'),
]);
exports.validatorAssignmentLog = (0, pg_core_1.pgTable)('validator_assignment_log', {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    orderItemId: (0, pg_core_1.serial)('order_item_id').notNull(),
    validatorId: (0, pg_core_1.serial)('validator_id').notNull(),
    tailorId: (0, pg_core_1.serial)('tailor_id').notNull(),
    assignmentReason: (0, pg_core_1.text)('assignment_reason'),
    assignedAt: (0, pg_core_1.timestamp)('assigned_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.orderItemId],
        foreignColumns: [exports.orderItems.id],
        name: "validator_assignment_log_order_item_id_fk"
    }).onDelete('cascade'),
    (0, pg_core_1.foreignKey)({
        columns: [table.validatorId],
        foreignColumns: [exports.validators.id],
        name: "validator_assignment_log_validator_id_fk"
    }).onDelete('restrict'),
    (0, pg_core_1.foreignKey)({
        columns: [table.tailorId],
        foreignColumns: [exports.tailors.id],
        name: "validator_assignment_log_tailor_id_fk"
    }).onDelete('restrict'),
]);
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.users.id],
        references: [exports.workshops.ownerUserId],
    }),
    magazine: one(exports.magazines, {
        fields: [exports.users.id],
        references: [exports.magazines.ownerUserId],
    }),
    tailor: one(exports.tailors, {
        fields: [exports.users.id],
        references: [exports.tailors.userId],
    }),
    validator: one(exports.validators, {
        fields: [exports.users.id],
        references: [exports.validators.userId],
    }),
}));
exports.workshopRelations = (0, drizzle_orm_1.relations)(exports.workshops, ({ one, many }) => ({
    owner: one(exports.users, {
        fields: [exports.workshops.ownerUserId],
        references: [exports.users.id],
    }),
    subscriptionPlan: one(exports.subscriptionPlans, {
        fields: [exports.workshops.subscriptionPlanId],
        references: [exports.subscriptionPlans.id],
    }),
    referralLinks: many(exports.referralLinks),
    tailors: many(exports.tailors),
    validators: many(exports.validators),
    magazines: many(exports.magazines),
    orders: many(exports.orders),
}));
exports.magazineRelations = (0, drizzle_orm_1.relations)(exports.magazines, ({ one, many }) => ({
    owner: one(exports.users, {
        fields: [exports.magazines.ownerUserId],
        references: [exports.users.id],
    }),
    workshop: one(exports.workshops, {
        fields: [exports.magazines.workshopId],
        references: [exports.workshops.id],
    }),
    orders: many(exports.orders),
}));
exports.referralLinkRelations = (0, drizzle_orm_1.relations)(exports.referralLinks, ({ one }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.referralLinks.workshopId],
        references: [exports.workshops.id],
    }),
}));
exports.tailorRelations = (0, drizzle_orm_1.relations)(exports.tailors, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.tailors.userId],
        references: [exports.users.id],
    }),
    workshop: one(exports.workshops, {
        fields: [exports.tailors.workshopId],
        references: [exports.workshops.id],
    }),
    orderItems: many(exports.orderItems),
    validatorAssignmentLogs: many(exports.validatorAssignmentLog),
}));
exports.validatorRelations = (0, drizzle_orm_1.relations)(exports.validators, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.validators.userId],
        references: [exports.users.id],
    }),
    workshop: one(exports.workshops, {
        fields: [exports.validators.workshopId],
        references: [exports.workshops.id],
    }),
    orders: many(exports.orders),
    assignedOrderItems: many(exports.orderItems),
    orderTrackingUpdates: many(exports.orderTracking),
    assignmentLogs: many(exports.validatorAssignmentLog),
}));
exports.orderRelations = (0, drizzle_orm_1.relations)(exports.orders, ({ one, many }) => ({
    magazine: one(exports.magazines, {
        fields: [exports.orders.magazineId],
        references: [exports.magazines.id],
    }),
    workshop: one(exports.workshops, {
        fields: [exports.orders.workshopId],
        references: [exports.workshops.id],
    }),
    validator: one(exports.validators, {
        fields: [exports.orders.validatorId],
        references: [exports.validators.id],
    }),
    orderItems: many(exports.orderItems),
    orderTracking: many(exports.orderTracking),
}));
exports.orderItemRelations = (0, drizzle_orm_1.relations)(exports.orderItems, ({ one, many }) => ({
    order: one(exports.orders, {
        fields: [exports.orderItems.orderId],
        references: [exports.orders.id],
    }),
    tailor: one(exports.tailors, {
        fields: [exports.orderItems.tailorId],
        references: [exports.tailors.id],
    }),
    assignedByValidator: one(exports.validators, {
        fields: [exports.orderItems.assignedByValidatorId],
        references: [exports.validators.id],
    }),
    assignmentLogs: many(exports.validatorAssignmentLog),
}));
exports.orderTrackingRelations = (0, drizzle_orm_1.relations)(exports.orderTracking, ({ one }) => ({
    order: one(exports.orders, {
        fields: [exports.orderTracking.orderId],
        references: [exports.orders.id],
    }),
    validator: one(exports.validators, {
        fields: [exports.orderTracking.validatorId],
        references: [exports.validators.id],
    }),
}));
exports.validatorAssignmentLogRelations = (0, drizzle_orm_1.relations)(exports.validatorAssignmentLog, ({ one }) => ({
    orderItem: one(exports.orderItems, {
        fields: [exports.validatorAssignmentLog.orderItemId],
        references: [exports.orderItems.id],
    }),
    validator: one(exports.validators, {
        fields: [exports.validatorAssignmentLog.validatorId],
        references: [exports.validators.id],
    }),
    tailor: one(exports.tailors, {
        fields: [exports.validatorAssignmentLog.tailorId],
        references: [exports.tailors.id],
    }),
}));
exports.subscriptionPlanRelations = (0, drizzle_orm_1.relations)(exports.subscriptionPlans, ({ many }) => ({
    workshops: many(exports.workshops),
}));
exports.subscriptionRelations = (0, drizzle_orm_1.relations)(exports.subscriptions, ({ one }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.subscriptions.workshopId],
        references: [exports.workshops.id],
    }),
}));
