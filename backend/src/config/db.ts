import mongoose from "mongoose";
import requiredConfig from "./requiredConfig";

const connectDB = async () => {
  try {
    await mongoose.connect(requiredConfig.MONGO_URI);
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Database connection error", error);
    process.exit(1);
  }
};

export default connectDB;