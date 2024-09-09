
require('dotenv').config();
const express = require('express');
const path = require('path');
const subscriptionRoutes = require('./routes/subscription.routes');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const db = require('./models/index');

const app = express();

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', subscriptionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);


db.sequelize.sync().then(() => {
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
