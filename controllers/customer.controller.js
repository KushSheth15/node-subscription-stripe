const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models/index');
const Customer = db.customer;

exports.createCustomer = async (req,res)=>{
    const {name,email} = req.body;

    try {
        const stripeCustomer = await stripe.customers.create({
            name,
            email
        });

        const customer = await Customer.create({
            name,
            email,
            stripeCustomerId:stripeCustomer.id
        });

        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

exports.getAllCustomers = async (req,res)=>{
    try {
        const customers = await Customer.findAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}