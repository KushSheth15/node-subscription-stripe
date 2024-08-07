require('dotenv').config();
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/',(req,res)=>{
    res.render('index.ejs')
})

app.get('/subscribe',async (req,res)=>{

    const plan = req.query.plan
    if(!plan){
        return res.send("Subscription plan not found");
    }

    let priceId;

    switch(plan.toLowerCase()){
        case 'starter':
            priceId='price_1Pl1bWFm8i1iaz8BfgQ8z95e'
            break

        case 'pro':
            priceId='price_1Pl1cBFm8i1iaz8BXVxZTasW'
            break

        default:
            return res.send("Invalid subscription plan");
    }

    const session = await stripe.checkout.sessions.create({
        mode:'subscription',
        line_items:[
            {
                price:priceId,
                quantity:1
            }
        ],
        success_url:`${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${process.env.BASE_URL}/cancel`,
    })

    res.redirect(session.url)
})

app.get('/success',async (req,res)=>{
   const session = await stripe.checkout.sessions.retrieve(req.query.session_id,{expand:['subscription','subscription.plan.product[*]']})
   console.log(JSON.stringify(session))
   res.send('Subscribed Successfully');
});

app.get('/cancel',(req,res)=>{
    res.redirect('/')
});

app.get('/customers/:customerId',async (req,res)=>{
    const portalSession = await stripe.billingPortal.sessions.create({
        customer:req.params.customerId,
        return_url:`${process.env.BASE_URL}/`,
    });

    res.redirect(portalSession.url);
})

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});