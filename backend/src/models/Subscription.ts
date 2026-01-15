import { Schema, model, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: Schema.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  planId: Schema.Types.ObjectId;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    stripeCustomerId: { 
        type: String, 
        required: true 
    },
    stripeSubscriptionId: { 
        type: String, 
        required: true,
        unique: true
    },
    status: { 
        type: String, 
        required: true 
    },
    currentPeriodStart: {
        type: Date,
        required: true
    },
    currentPeriodEnd: { 
        type: Date, 
        required: true 
    },
    planId: { 
        type: Schema.Types.ObjectId, 
        ref: "Plan",
        required: true
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    canceledAt: {
        type: Date
    }
  },
  { 
    timestamps: true 
  }
);

const Subscription = model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;