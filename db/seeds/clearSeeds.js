import db from "../index.js";
import * as schema from "../schemas/schema.js";

// Clear all database tables using Drizzle ORM
async function clearDatabase() {
  try {
    console.log("Clearing database tables...");

    // Delete from child tables first to avoid FK constraint errors
    await db.delete(schema.validatorAssignmentLog).execute();
    console.log("✓ validatorAssignmentLog cleared");

    await db.delete(schema.orderTracking).execute();
    console.log("✓ orderTracking cleared");

    await db.delete(schema.orderItems).execute();
    console.log("✓ orderItems cleared");

    await db.delete(schema.orders).execute();
    console.log("✓ orders cleared");

    await db.delete(schema.referralLinks).execute();
    console.log("✓ referralLinks cleared");

    await db.delete(schema.validators).execute();
    console.log("✓ validators cleared");

    await db.delete(schema.tailors).execute();
    console.log("✓ tailors cleared");

    await db.delete(schema.magazines).execute();
    console.log("✓ magazines cleared");

    await db.delete(schema.workshops).execute();
    console.log("✓ workshops cleared");

    await db.delete(schema.users).execute();
    console.log("✓ users cleared");

    await db.delete(schema.subscriptionPlans).execute();
    console.log("✓ subscriptionPlans cleared");

    console.log("\n✅ Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

clearDatabase();
