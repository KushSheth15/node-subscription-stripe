const express = require('express');
const router = express.Router();
const {subscribe,cancel,manageCustomer,renderHomepage,success} = require('../controllers/subscription.controller');

// Route to render the homepage
router.get('/', renderHomepage);

// Route to handle subscription
router.get('/subscribe', subscribe);

// Route to handle successful subscription
router.get('/success', success);

// Route to handle subscription cancellation
router.get('/cancel', cancel);

// Route to manage customer billing portal
router.get('/customers/:customerId', manageCustomer);

module.exports = router;
