import express, { Request, Response, Router } from "express";
import Stripe from "stripe";
import stripe from "../config/stripe";
import SubscriptionModel from "../models/Subscription";
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
        console.error("❌ Error verifying Stripe webhook signature:", err);
        return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;



        if (!session.subscription) {
            console.error("No subscription ID in checkout session:", session.id);
            return res.status(200).json({ received: true });
        }

        if (!session.metadata?.userId || !session.metadata?.planId) {
            console.error("Missing required metadata in session:", session.id);
            return res.status(200).json({ received: true });
        }

        try {
            const stripeSubscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            ) as Stripe.Subscription;

            const subscriptionData = {
                userId: session.metadata.userId,
                planId: session.metadata.planId,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: stripeSubscription.status,
                currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000)
            };

            const subscription = await SubscriptionModel.create(subscriptionData);
            console.log("Subscription created:", subscription.stripeSubscriptionId);
        } catch (error) {
            console.error("Failed to create subscription:", error);
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;

        try {
            const result = await SubscriptionModel.findOneAndUpdate(
                { stripeSubscriptionId: sub.id },
                { status: "canceled" }
            );

            if (!result) {
                console.warn("Subscription not found for cancellation:", sub.id);
            }
        } catch (error) {
            console.error("Error canceling subscription:", error);
        }
    }



    res.status(200).json({ received: true });
});

export default router;