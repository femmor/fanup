import express, { Request, Response, Router } from "express";
import Stripe from "stripe";
import stripe from "../config/stripe";
import SubscriptionModel from "../models/Subscription";
import UserModel from "../models/User";
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

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
                await handleSubscriptionCreatedOrUpdated(event.data.object as Stripe.Subscription);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error(`❌ Error handling webhook event ${event.type}:`, error);
        return res.status(400).json({ error: "Webhook handling failed" });
    }

    res.status(200).json({ received: true });
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log("🎉 Processing checkout session completed:", session.id);

    if (!session.subscription) {
        console.error("No subscription ID in checkout session:", session.id);
        return;
    }

    if (!session.metadata?.userId || !session.metadata?.planId) {
        console.error("Missing required metadata in session:", session.id);
        return;
    }

    // Update user with Stripe customer ID if not already set
    if (session.customer) {
        await UserModel.findByIdAndUpdate(session.metadata.userId, {
            $setOnInsert: { stripeCustomerId: session.customer as string }
        });
    }

    // The subscription will be handled by customer.subscription.created event
}

async function handleSubscriptionCreatedOrUpdated(stripeSubscription: Stripe.Subscription) {
    console.log("📝 Processing subscription created/updated:", stripeSubscription.id);

    // Find user by Stripe customer ID
    const user = await UserModel.findOne({ stripeCustomerId: stripeSubscription.customer as string });
    if (!user) {
        console.error("User not found for customer:", stripeSubscription.customer);
        return;
    }

    const subscriptionData = {
        userId: user._id,
        stripeCustomerId: stripeSubscription.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null
    };

    // For created events with metadata, include planId
    if (stripeSubscription.metadata?.planId) {
        (subscriptionData as any).planId = stripeSubscription.metadata.planId;
    }

    // Use upsert to prevent duplicates
    const subscription = await SubscriptionModel.findOneAndUpdate(
        { stripeSubscriptionId: stripeSubscription.id },
        subscriptionData,
        { upsert: true, new: true }
    );

    console.log("✅ Subscription saved:", subscription.stripeSubscriptionId);
}


export default router;