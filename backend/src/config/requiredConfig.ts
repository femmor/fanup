import dotenv from "dotenv";

dotenv.config();

const requiredConfig = {
  PORT: process.env.PORT || "",
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
};  

// Validate required env variables
const validateConfig = () => {
  for (const [key, value] of Object.entries(requiredConfig)) {
    if (!value) {
      console.error(`❌ Missing required config: ${key}`);
      process.exit(1);
    }
  }
}

validateConfig();

export default requiredConfig;

