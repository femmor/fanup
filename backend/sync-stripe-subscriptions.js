const mongoose = require('mongoose');
const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define schemas
const SubscriptionSchema = new mongoose.Schema({
  userId: { 
      type: mongoose.Schema.Types.ObjectId, 
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
      type: mongoose.Schema.Types.ObjectId, 
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
}, { 
  timestamps: true 
});

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ["admin", "fan"], 
        default: "fan"
    },
    stripeCustomerId: {
        type: String,
        sparse: true,
        unique: true
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
const User = mongoose.model("User", UserSchema);

async function syncStripeSubscriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    console.log('🔄 Starting Stripe subscription sync...');
    
    // Get all subscriptions from Stripe
    const stripeSubscriptions = [];
    let hasMore = true;
    let startingAfter = undefined;
    
    while (hasMore) {
      const response = await stripe.subscriptions.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['data.customer']
      });
      
      stripeSubscriptions.push(...response.data);
      hasMore = response.has_more;
      
      if (hasMore) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }
    
    console.log(`📊 Found ${stripeSubscriptions.length} subscriptions in Stripe`);
    
    let synced = 0;
    let errors = 0;
    
    for (const stripeSubscription of stripeSubscriptions) {
      try {
        // Find user by Stripe customer ID
        const customer = stripeSubscription.customer;
        const customerEmail = customer.email;
        
        let user = await User.findOne({ stripeCustomerId: customer.id });
        
        // If no user found by Stripe customer ID, try to find by email
        if (!user && customerEmail) {
          user = await User.findOne({ email: customerEmail });
          
          // Update user with Stripe customer ID if found
          if (user && !user.stripeCustomerId) {
            await User.findByIdAndUpdate(user._id, {
              stripeCustomerId: customer.id
            });
            console.log(`🔗 Linked user ${user.email} to Stripe customer ${customer.id}`);
          }
        }
        
        if (!user) {
          console.warn(`⚠️  No user found for Stripe customer ${customer.id} (${customerEmail})`);
          continue;
        }
        
        // Prepare subscription data
        const subscriptionData = {
          userId: user._id,
          stripeCustomerId: customer.id,
          stripeSubscriptionId: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          canceledAt: stripeSubscription.canceled_at ? 
            new Date(stripeSubscription.canceled_at * 1000) : null
        };
        
        // Upsert subscription in database
        const subscription = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: stripeSubscription.id },
          subscriptionData,
          { upsert: true, new: true }
        );
        
        console.log(`✅ Synced subscription ${stripeSubscription.id} for user ${user.email}`);
        synced++;
        
      } catch (error) {
        console.error(`❌ Error syncing subscription ${stripeSubscription.id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📋 Sync Summary:');
    console.log(`   Subscriptions synced: ${synced}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total Stripe subscriptions: ${stripeSubscriptions.length}`);
    
    // Show current database state
    const dbSubscriptions = await Subscription.find({}).populate('userId', 'email');
    console.log(`\n📊 Database now contains ${dbSubscriptions.length} subscriptions:`);
    
    dbSubscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.userId?.email || 'Unknown'} - ${sub.status} (${sub.stripeSubscriptionId})`);
    });
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔄 Database connection closed');
  }
}

// Run the sync
if (require.main === module) {
  syncStripeSubscriptions();
}

module.exports = { syncStripeSubscriptions };