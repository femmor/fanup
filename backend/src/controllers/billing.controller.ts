import type { Response } from "express";
import stripe from "../config/stripe";
import Plan from "../models/Plan";
import Subscription from "../models/Subscription";
import { AuthRequest } from "../middleware/requireAuth";
import User from "../models/User";

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    try {
        const { planId } = req.body;

        // Find plan by Stripe price ID instead of MongoDB _id
        const plan = await Plan.findOne({ stripePriceId: planId });

        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        // Get or create Stripe customer
        let stripeCustomerId = req.user?.stripeCustomerId;
        
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: req.user?.email,
                metadata: {
                    userId: req.user?._id.toString()
                }
            });
            
            stripeCustomerId = customer.id;
            
            // Update user with Stripe customer ID
            await User.findByIdAndUpdate(req.user?._id, {
                stripeCustomerId: stripeCustomerId
            });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: stripeCustomerId,
            line_items: [
                {
                    price: plan.stripePriceId,
                    quantity: 1
                }
            ],
            success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing`,
            metadata: {
                userId: req.user?._id.toString(),
                planId: plan._id.toString()
            }
        });

        res.json({ 
            sessionId: session.id,
            url: session.url 
        });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: "Failed to create checkout session" });
    }
}

export const getUserSubscriptions = async (req: AuthRequest, res: Response) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user?._id })
            .populate('planId')
            .exec();
        
        console.log(`Found ${subscriptions.length} subscriptions for user ${req.user?._id}`);
        res.json(subscriptions);
    } catch (error) {
        console.error("Error fetching user subscriptions:", error);
        res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
}

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
    try {
        const { subscriptionId } = req.params;
        
        // Find subscription in database
        const subscription = await Subscription.findOne({
            _id: subscriptionId,
            userId: req.user?._id
        });

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        // Cancel in Stripe
        const canceledSubscription = await stripe.subscriptions.update(
            subscription.stripeSubscriptionId,
            { cancel_at_period_end: true }
        );

        // Update in database
        await Subscription.findByIdAndUpdate(subscriptionId, {
            cancelAtPeriodEnd: true,
            status: canceledSubscription.status
        });

        res.json({ 
            message: "Subscription will be canceled at the end of billing period",
            cancelAtPeriodEnd: true,
            currentPeriodEnd: subscription.currentPeriodEnd
        });
    } catch (error) {
        console.error("Error canceling subscription:", error);
        res.status(500).json({ message: "Failed to cancel subscription" });
    }
}

export const createCustomerPortal = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.stripeCustomerId) {
            return res.status(400).json({ message: "No Stripe customer found" });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: req.user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_URL}/dashboard`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating customer portal session:", error);
        res.status(500).json({ message: "Failed to create customer portal session" });
    }
}