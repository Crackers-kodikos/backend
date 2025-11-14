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
exports.getBillingInfo = exports.getSubscriptionHistory = exports.upgradePlan = exports.cancelSubscription = exports.getCurrentSubscription = exports.subscribeToPlan = exports.getPlanDetails = exports.getAvailablePlans = void 0;
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// ============== SUBSCRIPTION PLANS ==============
// Get Available Plans
const getAvailablePlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Query database for plans
        const plans = yield index_js_1.default.select().from(schema_js_1.subscriptionPlans).all();
        if (!plans || plans.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No subscription plans found",
                data: {
                    count: 0,
                    plans: []
                }
            });
        }
        // Format plans for response
        const formattedPlans = plans.map(plan => ({
            id: plan.id,
            planName: plan.planName,
            maxMagazines: plan.maxMagazines,
            maxTailors: plan.maxTailors,
            maxValidators: plan.maxValidators,
            price: parseFloat(plan.price),
            currency: 'USD',
            billingCycle: 'monthly',
            features: plan.features ? JSON.parse(plan.features) : {},
            popular: plan.planName === 'Professional'
        }));
        return res.status(200).json({
            success: true,
            message: "Available plans retrieved successfully",
            data: {
                count: formattedPlans.length,
                plans: formattedPlans
            }
        });
    }
    catch (error) {
        console.error("Error retrieving plans:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve plans",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getAvailablePlans = getAvailablePlans;
// Get Plan Details
const getPlanDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { planId } = req.params;
        // Query database for specific plan
        const plan = yield index_js_1.default.select().from(schema_js_1.subscriptionPlans)
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptionPlans.id, parseInt(planId)))
            .limit(1);
        if (!plan || plan.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Plan not found"
            });
        }
        const planData = plan[0];
        const benefits = {
            Beginner: [
                'Up to 3 local shops can order',
                'Up to 3 tailors in team',
                '50 orders per month',
                'Email support',
                'Basic analytics'
            ],
            Professional: [
                'Up to 10 local shops can order',
                'Up to 10 tailors in team',
                '500 orders per month',
                'Priority email support',
                'Advanced analytics',
                'Custom branding'
            ],
            Enterprise: [
                'Unlimited local shops',
                'Unlimited tailors',
                '5000+ orders per month',
                '24/7 phone support',
                'Premium analytics',
                'Custom branding',
                'Dedicated account manager',
                'API access'
            ]
        };
        return res.status(200).json({
            success: true,
            message: "Plan details retrieved successfully",
            data: {
                id: planData.id,
                planName: planData.planName,
                maxMagazines: planData.maxMagazines,
                maxTailors: planData.maxTailors,
                maxValidators: planData.maxValidators,
                price: parseFloat(planData.price),
                currency: 'USD',
                billingCycle: 'monthly',
                features: planData.features ? JSON.parse(planData.features) : {},
                benefits: benefits[planData.planName] || []
            }
        });
    }
    catch (error) {
        console.error("Error retrieving plan:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve plan",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getPlanDetails = getPlanDetails;
// ============== SUBSCRIPTION MANAGEMENT ==============
// Subscribe to Plan (with FAKE PAYMENT)
const subscribeToPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { planId, paymentMethodToken } = req.body;
        if (!planId || !paymentMethodToken) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: planId, paymentMethodToken"
            });
        }
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (!workshop || workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get plan details
        const plan = yield index_js_1.default.select().from(schema_js_1.subscriptionPlans)
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptionPlans.id, parseInt(planId)))
            .limit(1);
        if (!plan || plan.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Plan not found"
            });
        }
        // ============== FAKE PAYMENT PROCESSING ==============
        const paymentSuccess = Math.random() > 0.1; // 90% success
        if (!paymentSuccess) {
            return res.status(402).json({
                success: false,
                message: "Payment declined - Insufficient funds",
                paymentError: {
                    code: "PAYMENT_DECLINED",
                    reason: "Card declined by issuer"
                }
            });
        }
        // Generate fake transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Create subscription
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        // Check if subscription already exists
        const existingSubscription = yield index_js_1.default.select().from(schema_js_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.workshopId, workshop[0].id), (0, drizzle_orm_1.eq)(schema_js_1.subscriptions.status, 'active')))
            .limit(1);
        let newSubscription;
        if (existingSubscription && existingSubscription.length > 0) {
            // Update existing subscription
            newSubscription = yield index_js_1.default.update(schema_js_1.subscriptions)
                .set({
                planType: plan[0].planName,
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                paymentStatus: 'completed',
                transactionId: transactionId,
                renewalDate: endDate,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.id, existingSubscription[0].id))
                .returning();
        }
        else {
            // Create new subscription
            newSubscription = yield index_js_1.default.insert(schema_js_1.subscriptions).values({
                workshopId: workshop[0].id,
                planType: plan[0].planName,
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                paymentStatus: 'completed',
                transactionId: transactionId,
                renewalDate: endDate,
                createdAt: startDate
            }).returning();
        }
        return res.status(201).json({
            success: true,
            message: "Subscription created successfully with simulated payment",
            data: {
                subscriptionId: newSubscription[0].id,
                planType: newSubscription[0].planType,
                status: newSubscription[0].status,
                startDate: newSubscription[0].startDate,
                endDate: newSubscription[0].endDate,
                paymentStatus: newSubscription[0].paymentStatus,
                transactionId: transactionId,
                note: "This is a MOCK payment - for testing only"
            }
        });
    }
    catch (error) {
        console.error("Error subscribing to plan:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to subscribe to plan",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.subscribeToPlan = subscribeToPlan;
// Get Current Subscription
const getCurrentSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (!workshop || workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get active subscription
        const subscription = yield index_js_1.default.select().from(schema_js_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.workshopId, workshop[0].id), (0, drizzle_orm_1.eq)(schema_js_1.subscriptions.status, 'active')))
            .limit(1);
        if (!subscription || subscription.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active subscription found"
            });
        }
        // Get plan details
        const plan = yield index_js_1.default.select().from(schema_js_1.subscriptionPlans)
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptionPlans.id, subscription[0].id))
            .limit(1);
        const planLimits = {
            Beginner: { maxMagazines: 3, maxTailors: 3, orderLimit: 50 },
            Professional: { maxMagazines: 10, maxTailors: 10, orderLimit: 500 },
            Enterprise: { maxMagazines: 100, maxTailors: 100, orderLimit: 5000 }
        };
        return res.status(200).json({
            success: true,
            message: "Current subscription retrieved successfully",
            data: {
                subscriptionId: subscription[0].id,
                planType: subscription[0].planType,
                status: subscription[0].status,
                startDate: subscription[0].startDate,
                endDate: subscription[0].endDate,
                renewalDate: subscription[0].renewalDate,
                paymentStatus: subscription[0].paymentStatus,
                limits: planLimits[subscription[0].planType] || {},
                daysRemaining: Math.ceil((new Date(subscription[0].endDate) - new Date()) / (1000 * 60 * 60 * 24))
            }
        });
    }
    catch (error) {
        console.error("Error retrieving subscription:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve subscription",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getCurrentSubscription = getCurrentSubscription;
// Cancel Subscription
const cancelSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (!workshop || workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get active subscription
        const subscription = yield index_js_1.default.select().from(schema_js_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.workshopId, workshop[0].id), (0, drizzle_orm_1.eq)(schema_js_1.subscriptions.status, 'active')))
            .limit(1);
        if (!subscription || subscription.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active subscription found"
            });
        }
        // Update subscription status
        const cancelled = yield index_js_1.default.update(schema_js_1.subscriptions)
            .set({
            status: 'cancelled',
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.id, subscription[0].id))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Subscription cancelled successfully",
            data: {
                subscriptionId: cancelled[0].id,
                status: cancelled[0].status,
                cancelledAt: new Date()
            }
        });
    }
    catch (error) {
        console.error("Error cancelling subscription:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel subscription",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.cancelSubscription = cancelSubscription;
// Upgrade Plan (with FAKE PAYMENT)
const upgradePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { newPlanId, paymentMethodToken } = req.body;
        if (!newPlanId || !paymentMethodToken) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: newPlanId, paymentMethodToken"
            });
        }
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (!workshop || workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get current subscription
        const subscription = yield index_js_1.default.select().from(schema_js_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.workshopId, workshop[0].id), (0, drizzle_orm_1.eq)(schema_js_1.subscriptions.status, 'active')))
            .limit(1);
        if (!subscription || subscription.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active subscription found"
            });
        }
        // Get new plan
        const newPlan = yield index_js_1.default.select().from(schema_js_1.subscriptionPlans)
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptionPlans.id, parseInt(newPlanId)))
            .limit(1);
        if (!newPlan || newPlan.length === 0) {
            return res.status(404).json({
                success: false,
                message: "New plan not found"
            });
        }
        // ============== FAKE PAYMENT FOR UPGRADE ==============
        const paymentSuccess = Math.random() > 0.1; // 90% success
        if (!paymentSuccess) {
            return res.status(402).json({
                success: false,
                message: "Payment declined - Please check your payment method",
                paymentError: {
                    code: "PAYMENT_DECLINED",
                    reason: "Card declined"
                }
            });
        }
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Update subscription
        const endDate = new Date(subscription[0].endDate);
        endDate.setMonth(endDate.getMonth() + 1);
        const upgraded = yield index_js_1.default.update(schema_js_1.subscriptions)
            .set({
            planType: newPlan[0].planName,
            endDate: endDate,
            renewalDate: endDate,
            paymentStatus: 'completed',
            transactionId: transactionId,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.id, subscription[0].id))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Plan upgraded successfully with simulated payment",
            data: {
                subscriptionId: upgraded[0].id,
                previousPlan: subscription[0].planType,
                newPlan: upgraded[0].planType,
                status: upgraded[0].status,
                endDate: upgraded[0].endDate,
                transactionId: transactionId,
                note: "This is a MOCK payment - for testing only"
            }
        });
    }
    catch (error) {
        console.error("Error upgrading plan:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upgrade plan",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.upgradePlan = upgradePlan;
// ============== SUBSCRIPTION HISTORY ==============
// Get Subscription History
const getSubscriptionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (!workshop || workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get all subscriptions
        const history = yield index_js_1.default.select().from(schema_js_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.workshopId, workshop[0].id))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.subscriptions.createdAt));
        return res.status(200).json({
            success: true,
            message: "Subscription history retrieved successfully",
            data: {
                count: history.length,
                subscriptions: history
            }
        });
    }
    catch (error) {
        console.error("Error retrieving history:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve subscription history",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getSubscriptionHistory = getSubscriptionHistory;
// ============== BILLING & PAYMENTS ==============
// Get Billing Information
const getBillingInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (!workshop || workshop.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }
        // Get active subscription
        const subscription = yield index_js_1.default.select().from(schema_js_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.workshopId, workshop[0].id), (0, drizzle_orm_1.eq)(schema_js_1.subscriptions.status, 'active')))
            .limit(1);
        // Get plan info
        let planInfo = {};
        if (subscription && subscription.length > 0) {
            const plan = yield index_js_1.default.select().from(schema_js_1.subscriptionPlans)
                .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptionPlans.planName, subscription[0].planType))
                .limit(1);
            if (plan && plan.length > 0) {
                planInfo = plan[0];
            }
        }
        const billingInfo = {
            workshopId: workshop[0].id,
            workshopName: workshop[0].name,
            currentPlan: subscription && subscription.length > 0 ? subscription[0].planType : 'none',
            monthlyAmount: subscription && subscription.length > 0 ? parseFloat(planInfo.price || 0) : 0,
            currency: 'USD',
            billingCycle: 'monthly',
            nextBillingDate: subscription && subscription.length > 0 ? subscription[0].renewalDate : null,
            paymentStatus: subscription && subscription.length > 0 ? subscription[0].paymentStatus : 'none',
            lastTransaction: subscription && subscription.length > 0 ? subscription[0].transactionId : null
        };
        return res.status(200).json({
            success: true,
            message: "Billing information retrieved successfully",
            data: billingInfo
        });
    }
    catch (error) {
        console.error("Error retrieving billing info:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve billing information",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getBillingInfo = getBillingInfo;
exports.default = {
    getAvailablePlans: exports.getAvailablePlans,
    getPlanDetails: exports.getPlanDetails,
    subscribeToPlan: exports.subscribeToPlan,
    getCurrentSubscription: exports.getCurrentSubscription,
    cancelSubscription: exports.cancelSubscription,
    upgradePlan: exports.upgradePlan,
    getSubscriptionHistory: exports.getSubscriptionHistory,
    getBillingInfo: exports.getBillingInfo
};
