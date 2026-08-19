const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorHandler');

const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const customersRouter = require('./routes/customers');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const reviewsRouter = require('./routes/reviews');
const suppliersRouter = require('./routes/suppliers');
const analyticsRouter = require('./routes/analytics');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/analytics', analyticsRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
