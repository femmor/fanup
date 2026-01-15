import { Router } from "express";
// import { requireAuth } from "../middleware/requireAuth";
import { createCheckoutSession, getUserSubscriptions } from "../controllers/billing.controller";

const router = Router();

// Unprotected routes
router.post("/checkout", createCheckoutSession);

// Protected endpoints
router.get("/subscriptions", getUserSubscriptions);

export default router;