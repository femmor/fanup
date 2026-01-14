import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { createCheckoutSession } from "../controllers/billing.controller";

const router = Router();
router.use(requireAuth);

router.post("/checkout", createCheckoutSession);

export default router;