import healthRoute from "./routes/health.route";
import authRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes";

import app from "./app";
import connectDB from "./config/db";
import requiredConfig from "./config/requiredConfig";
import billingRoute from "./routes/billing.route";

// Routes
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes)
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