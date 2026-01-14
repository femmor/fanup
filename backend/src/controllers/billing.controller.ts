import type { Response } from "express";
import stripe from "../config/stripe";
import Plan from "../models/Plan";
import Subscription from "../models/Subscription";
import { AuthRequest } from "../middleware/requireAuth";

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    const { planId } = req.body;

    const plan = await Plan.findById(planId);

    if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
    }

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: plan.stripePriceId,
                quantity: 1
            }
        ],
        customer_email: req.user.email,
        success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: {
            userId: req.user._id.toString(),
            planId: plan._id.toString()
        }
    });

    res.json({ sessionId: session.id });
}