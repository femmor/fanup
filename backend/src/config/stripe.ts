import Stripe from "stripe";
import requiredConfig from "./requiredConfig";

const stripe = new Stripe(requiredConfig.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
});

export default stripe;