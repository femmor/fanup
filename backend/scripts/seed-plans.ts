import dotenv from "dotenv";
import mongoose from "mongoose";
import Plan from "../src/models/Plan";
import requiredConfig from "../src/config/requiredConfig";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = requiredConfig.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedPlans = async () => {
  try {
    console.log("🔄 Starting database connection...");
    await connectDB();
    
    // Clear existing plans (optional)
    const deleteResult = await Plan.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing plans`);

    // Create test plans
    const plans = [
      {
        name: "Basic Plan",
        price: 999, // $9.99 in cents
        interval: "month",
        stripePriceId: "price_1SpZPqFkjkgoUvKMRo94kF2D" // Your actual Stripe price ID
      },
      {
        name: "Pro Plan", 
        price: 1999, // $19.99 in cents
        interval: "month",
        stripePriceId: "price_1TestProPlan123456789" // Replace with actual Stripe price ID
      },
      {
        name: "Premium Plan",
        price: 3999, // $39.99 in cents
        interval: "month", 
        stripePriceId: "price_1TestPremiumPlan123456" // Replace with actual Stripe price ID
      },
      {
        name: "Basic Annual",
        price: 9999, // $99.99 in cents (yearly)
        interval: "year",
        stripePriceId: "price_1TestBasicAnnual123456" // Replace with actual Stripe price ID
      }
    ];

    console.log("📋 Inserting plans into database...");
    const createdPlans = await Plan.insertMany(plans);
    console.log(`✅ Successfully created ${createdPlans.length} plans:`);
    
    // Verify the data was inserted
    const totalCount = await Plan.countDocuments();
    console.log(`📊 Total plans in database: ${totalCount}`);
    
    // Display created plans
    const allPlans = await Plan.find({});
    console.log("📋 All plans in database:");
    allPlans.forEach(plan => {
      console.log(`  - ${plan.name}: $${plan.price/100} (${plan.stripePriceId})`);
    });
    
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
  } finally {
    console.log("🔄 Closing database connection...");
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seeding
seedPlans();