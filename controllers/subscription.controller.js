const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models/index');
const Product = db.product;
const Subscription = db.subscription;

exports.renderHomepage = (req, res) => {
    const userId = req.user ? req.user.id : null;
    res.render('index', { userId });
};

exports.subscribe = async (req, res) => {
    const { plan, userId } = req.query;

    if (!plan || !userId) {
        return res.send("Subscription plan or user ID not found");
    }

    let priceId;

    try {
        // Fetch priceId from the database based on the plan
        const product = await Product.findOne({
            where: { name: plan.toLowerCase() }
        });

        if (!product) {
            return res.send("Invalid subscription plan");
        }

        priceId = product.stripePriceId;

        if (!priceId) {
            return res.send("Price ID not found for this plan");
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/cancel`,
        });

        // Store subscription details in the database with 'pending' status
        await Subscription.create({
            stripeSubscriptionId: session.id,
            userId,
            status: 'pending', // Initial status before payment confirmation
            plan: plan.toLowerCase()
        });
        res.redirect(session.url);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.success = async (req, res) => {
    try {
        const sessionId = req.query.session_id;

        // Retrieve the session and expand subscription details
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'subscription.plan.product']
        });

        const subscriptionId = session.subscription ? session.subscription.id : null;

        if (!subscriptionId) {
            throw new Error('Subscription ID not found in session');
        }

        // Update subscription status in the database to 'active'
        await Subscription.update(
            { 
                status: 'active',
                stripeSubscriptionId: subscriptionId // Update with actual subscription ID
            },
            { 
                where: { stripeSubscriptionId: sessionId } // Use session ID to find the record
            }
        );

        res.render('success', { session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cancel = async (req, res) => {
    const { subscriptionId } = req.query;

    try {
        console.log('Attempting to cancel subscription with ID:', subscriptionId);

        // Cancel the subscription
        await stripe.subscriptions.cancel(subscriptionId); // Correct method for canceling a subscription

        // Optionally update the subscription status in your database
        await Subscription.update(
            { status: 'canceled' },
            { where: { stripeSubscriptionId: subscriptionId } }
        );

        res.render('cancel');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.manageCustomer = async (req, res) => {
    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: req.params.customerId,
            return_url: `${process.env.BASE_URL}/`,
        });

        res.redirect(portalSession.url);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
