const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/analytics/customer-spending
// Query 2 — total amount spent by each customer (DELIVERED orders only)
router.get('/customer-spending', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT cu.customer_id, cu.first_name, cu.last_name, SUM(o.total_amount) AS total_spent
    FROM Customer cu
    JOIN Order_Tbl o ON cu.customer_id = o.customer_id
    WHERE o.status = 'DELIVERED'
    GROUP BY cu.customer_id, cu.first_name, cu.last_name
    ORDER BY total_spent DESC
  `);
  res.json(rows);
}));

// GET /api/analytics/ratings
// Query 4 — average rating per product
router.get('/ratings', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.product_id, p.product_name, ROUND(AVG(r.rating), 2) AS avg_rating,
           COUNT(r.review_id) AS review_count
    FROM Product p
    LEFT JOIN Review r ON p.product_id = r.product_id
    GROUP BY p.product_id, p.product_name
    ORDER BY avg_rating DESC
  `);
  res.json(rows);
}));

// GET /api/analytics/low-stock?threshold=50
// Query 5 — products below a stock threshold
router.get('/low-stock', asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) || 50;
  const [rows] = await pool.query(
    'SELECT product_id, product_name, stock_quantity FROM Product WHERE stock_quantity < ? ORDER BY stock_quantity',
    [threshold]
  );
  res.json(rows);
}));

// GET /api/analytics/inactive-customers
// Query 6 — customers who have never placed an order
router.get('/inactive-customers', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT customer_id, first_name, last_name, email
    FROM Customer
    WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM Order_Tbl)
  `);
  res.json(rows);
}));

// GET /api/analytics/best-sellers?limit=5
// Query 7 — best-selling products by total quantity ordered
router.get('/best-sellers', asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const [rows] = await pool.query(
    `SELECT p.product_id, p.product_name, SUM(oi.quantity) AS total_sold
     FROM Order_Item oi
     JOIN Product p ON oi.product_id = p.product_id
     GROUP BY p.product_id, p.product_name
     ORDER BY total_sold DESC
     LIMIT ?`,
    [limit]
  );
  res.json(rows);
}));

// GET /api/analytics/suppliers
// Query 9 — suppliers and the products they provide, with cost price
router.get('/suppliers', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT s.supplier_id, s.supplier_name, p.product_id, p.product_name, ps.cost_price
    FROM Supplier s
    JOIN Product_Supplier ps ON s.supplier_id = ps.supplier_id
    JOIN Product p ON ps.product_id = p.product_id
    ORDER BY s.supplier_name
  `);
  res.json(rows);
}));

// GET /api/analytics/payment-summary
// Query 10 — payment status summary
router.get('/payment-summary', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT status, COUNT(*) AS num_payments, SUM(amount) AS total_amount
    FROM Payment
    GROUP BY status
  `);
  res.json(rows);
}));

module.exports = router;
