"use client"

import { api } from "@/lib/api"

export default function PricingPage() {
    const subscribe = async (planId: string) => {
        try {
            // Get the checkout URL directly from the backend
            const res = await api.post("/billing/checkout", { planId });
            console.log(res.data)
            
            // Redirect to the checkout URL
            if (res.data.url) {
                window.location.href = res.data.url;
            } else {
                console.error('No checkout URL received');
            }
        } catch (error) {
            console.error('Subscription error:', error);
        }
    };

    return (
    <button onClick={() => subscribe("price_1SpZPqFkjkgoUvKMRo94kF2D")}>
      Subscribe
    </button>
  );

}