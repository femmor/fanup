import dotenv from "dotenv";
import healthRoute from "./routes/health.route";

dotenv.config();

import app from "./app";
import connectDB from "./config/db";

// Routes
app.use("/api/health", healthRoute);

const PORT = process.env.PORT || 5005;

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