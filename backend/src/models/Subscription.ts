import { Schema, model } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User" 
    },
    stripeCustomerId: { 
        type: String, 
        required: true 
    },
    stripeSubscriptionId: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        required: true 
    },
    currentPeriodEnd: { 
        type: Date, 
        required: true 
    },
    planId: { 
        type: Schema.Types.ObjectId, 
        ref: "Plan" 
    }
  },
  { 
    timestamps: true 
  }
);

const Subscription = model("Subscription", SubscriptionSchema);

export default Subscription;