const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const SubscriptionSchema = new mongoose.Schema({
  userId: { 
      type: mongoose.Schema.Types.ObjectId, 
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
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Plan" 
  }
}, { 
  timestamps: true 
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

async function checkSubscriptions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    const subscriptions = await Subscription.find({});
    console.log(`📊 Found ${subscriptions.length} subscriptions in database:`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ID: ${sub._id}`);
      console.log(`   User ID: ${sub.userId}`);
      console.log(`   Stripe Subscription ID: ${sub.stripeSubscriptionId}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Created: ${sub.createdAt}`);
      console.log('---');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error checking subscriptions:', error);
  }
}

checkSubscriptions();