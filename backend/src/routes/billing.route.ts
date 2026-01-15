import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { 
    createCheckoutSession, 
    getUserSubscriptions,
    cancelSubscription,
    createCustomerPortal 
} from "../controllers/billing.controller";

const router = Router();

// Protected endpoints - all billing operations require authentication
router.post("/checkout", requireAuth, createCheckoutSession);
router.get("/subscriptions", requireAuth, getUserSubscriptions);
router.put("/subscriptions/:subscriptionId/cancel", requireAuth, cancelSubscription);
router.post("/customer-portal", requireAuth, createCustomerPortal);

export default router;