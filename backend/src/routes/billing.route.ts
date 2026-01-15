import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { 
    createCheckoutSession, 
    getUserSubscriptions,
    cancelSubscription,
    createCustomerPortal 
} from "../controllers/billing.controller";

const router = Router();
router.use(requireAuth);

// Protected endpoints - all billing operations require authentication
router.post("/checkout", createCheckoutSession);
router.get("/subscriptions", getUserSubscriptions);
router.put("/subscriptions/:subscriptionId/cancel", cancelSubscription);
router.post("/customer-portal", createCustomerPortal);

export default router;