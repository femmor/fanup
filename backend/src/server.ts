import express from "express";

import healthRoute from "./routes/health.route";
import authRoute from "./routes/auth.route";
import protectedRoute from "./routes/protected.route";
import webhookRoutes from "./routes/webhook.route";

import app from "./app";
import connectDB from "./config/db";
import requiredConfig from "./config/requiredConfig";
import billingRoute from "./routes/billing.route";

// Webhook route must come before express.json() middleware to receive raw body
app.use("/api/webhooks", webhookRoutes);

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/protected", protectedRoute)
app.use("/api/billing", billingRoute);

const PORT = requiredConfig.PORT;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

startServer();