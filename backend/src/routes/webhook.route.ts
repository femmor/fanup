import express, { Request, Response, Router } from "express";
import Stripe from "stripe";
import stripe from "../config/stripe";
import Subscription from "../models/Subscription";
import requiredConfig from "../config/requiredConfig";

const router = Router();

router.post("/stripe", express.raw({
    type: "application/json",
}), async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            requiredConfig.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err) {
        console.error("Error verifying Stripe webhook signature:", err);
        return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        await Subscription.create({
            userId: session.metadata?.userId,
            planId: session.metadata?.planId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "active",
            currentPeriodEnd: new Date()
        });
    }

    if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;

        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: sub.id },
            { status: "canceled" }
        );
    }

    res.status(200).json({ received: true });
});

export default router;