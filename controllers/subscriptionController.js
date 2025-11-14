import { subscriptions, subscriptionPlans, workshops, users } from '../db/schemas/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import db from "../db/index.js";
import { config } from "../config/env.js";

// ============== SUBSCRIPTION PLANS ==============

// Get Available Plans
export const getAvailablePlans = async (req, res) => {
  try {
    // Query database for plans
    const plans = await db.select().from(subscriptionPlans).all();

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

  } catch (error) {
    console.error("Error retrieving plans:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve plans",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Plan Details
export const getPlanDetails = async (req, res) => {
  try {
    const { planId } = req.params;

    // Query database for specific plan
    const plan = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, parseInt(planId)))
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

  } catch (error) {
    console.error("Error retrieving plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve plan",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== SUBSCRIPTION MANAGEMENT ==============

// Subscribe to Plan (with FAKE PAYMENT)
export const subscribeToPlan = async (req, res) => {
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
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (!workshop || workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get plan details
    const plan = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, parseInt(planId)))
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
    const existingSubscription = await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.workshopId, workshop[0].id),
        eq(subscriptions.status, 'active')
      ))
      .limit(1);

    let newSubscription;

    if (existingSubscription && existingSubscription.length > 0) {
      // Update existing subscription
      newSubscription = await db.update(subscriptions)
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
        .where(eq(subscriptions.id, existingSubscription[0].id))
        .returning();
    } else {
      // Create new subscription
      newSubscription = await db.insert(subscriptions).values({
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

  } catch (error) {
    console.error("Error subscribing to plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to subscribe to plan",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Current Subscription
export const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (!workshop || workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get active subscription
    const subscription = await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.workshopId, workshop[0].id),
        eq(subscriptions.status, 'active')
      ))
      .limit(1);

    if (!subscription || subscription.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    // Get plan details
    const plan = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, subscription[0].id))
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

  } catch (error) {
    console.error("Error retrieving subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve subscription",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Cancel Subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (!workshop || workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get active subscription
    const subscription = await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.workshopId, workshop[0].id),
        eq(subscriptions.status, 'active')
      ))
      .limit(1);

    if (!subscription || subscription.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    // Update subscription status
    const cancelled = await db.update(subscriptions)
      .set({
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription[0].id))
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

  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Upgrade Plan (with FAKE PAYMENT)
export const upgradePlan = async (req, res) => {
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
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (!workshop || workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get current subscription
    const subscription = await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.workshopId, workshop[0].id),
        eq(subscriptions.status, 'active')
      ))
      .limit(1);

    if (!subscription || subscription.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    // Get new plan
    const newPlan = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, parseInt(newPlanId)))
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

    const upgraded = await db.update(subscriptions)
      .set({
        planType: newPlan[0].planName,
        endDate: endDate,
        renewalDate: endDate,
        paymentStatus: 'completed',
        transactionId: transactionId,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription[0].id))
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

  } catch (error) {
    console.error("Error upgrading plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upgrade plan",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== SUBSCRIPTION HISTORY ==============

// Get Subscription History
export const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (!workshop || workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get all subscriptions
    const history = await db.select().from(subscriptions)
      .where(eq(subscriptions.workshopId, workshop[0].id))
      .orderBy(desc(subscriptions.createdAt));

    return res.status(200).json({
      success: true,
      message: "Subscription history retrieved successfully",
      data: {
        count: history.length,
        subscriptions: history
      }
    });

  } catch (error) {
    console.error("Error retrieving history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve subscription history",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============== BILLING & PAYMENTS ==============

// Get Billing Information
export const getBillingInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (!workshop || workshop.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found"
      });
    }

    // Get active subscription
    const subscription = await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.workshopId, workshop[0].id),
        eq(subscriptions.status, 'active')
      ))
      .limit(1);

    // Get plan info
    let planInfo = {};
    if (subscription && subscription.length > 0) {
      const plan = await db.select().from(subscriptionPlans)
        .where(eq(subscriptionPlans.planName, subscription[0].planType))
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

  } catch (error) {
    console.error("Error retrieving billing info:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve billing information",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export default {
  getAvailablePlans,
  getPlanDetails,
  subscribeToPlan,
  getCurrentSubscription,
  cancelSubscription,
  upgradePlan,
  getSubscriptionHistory,
  getBillingInfo
};
