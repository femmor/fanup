import { Schema, model } from "mongoose";

export interface IPlan {
  name: string;
  price: number;
  interval: string; // "month" or "year"
  stripePriceId: string;
}

const PlanSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  interval: {
    type: String,
    enum: ["month", "year"],
    required: true
  },
  stripePriceId: {
    type: String,
    required: true
  }
});

const Plan = model("Plan", PlanSchema);

export default Plan;