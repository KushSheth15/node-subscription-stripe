
const express = require('express');
const router = express.Router();
const {createProduct,getAllProducts} = require('../controllers/product.controller');

router.post('/create', createProduct);

router.get('/get-products', getAllProducts);

module.exports = router;
