const express = require('express');
const router = express.Router();
const {createCustomer,getAllCustomers} = require('../controllers/customer.controller');

router.post('/create',createCustomer);

router.get('/getall',getAllCustomers);

module.exports = router;