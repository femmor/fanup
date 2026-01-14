import healthRoute from "./routes/health.route";
import authRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes";

import app from "./app";
import connectDB from "./config/db";
import requiredConfig from "./config/requiredConfig";

// Routes
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes)

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