const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/products
// Query 1 from queries.sql — products joined with their category,
// optionally filtered by ?category_id= and searched by ?q=
router.get('/', asyncHandler(async (req, res) => {
  const { category_id, q } = req.query;
  const params = [];
  let sql = `
    SELECT p.product_id, p.product_name, p.sku, p.description, p.price,
           p.stock_quantity, p.created_at,
           c.category_id, c.category_name
    FROM Product p
    JOIN Category c ON p.category_id = c.category_id
    WHERE 1=1
  `;

  if (category_id) {
    sql += ' AND p.category_id = ?';
    params.push(category_id);
  }
  if (q) {
    sql += ' AND p.product_name LIKE ?';
    params.push(`%${q}%`);
  }

  sql += ' ORDER BY p.product_id';

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

// GET /api/products/:id
// Single product + its average rating (query 4) + reviews + suppliers
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [[product]] = await pool.query(
    `SELECT p.*, c.category_name
     FROM Product p
     JOIN Category c ON p.category_id = c.category_id
     WHERE p.product_id = ?`,
    [id]
  );

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const [[ratingRow]] = await pool.query(
    `SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(review_id) AS review_count
     FROM Review WHERE product_id = ?`,
    [id]
  );

  const [reviews] = await pool.query(
    `SELECT r.review_id, r.rating, r.comment, r.review_date,
            cu.first_name, cu.last_name
     FROM Review r
     JOIN Customer cu ON r.customer_id = cu.customer_id
     WHERE r.product_id = ?
     ORDER BY r.review_date DESC`,
    [id]
  );

  const [suppliers] = await pool.query(
    `SELECT s.supplier_id, s.supplier_name, ps.cost_price
     FROM Product_Supplier ps
     JOIN Supplier s ON ps.supplier_id = s.supplier_id
     WHERE ps.product_id = ?`,
    [id]
  );

  res.json({
    ...product,
    avg_rating: ratingRow.avg_rating,
    review_count: ratingRow.review_count,
    reviews,
    suppliers
  });
}));

// POST /api/products
router.post('/', asyncHandler(async (req, res) => {
  const { category_id, product_name, sku, description, price, stock_quantity } = req.body;

  if (!category_id || !product_name || !sku || price === undefined) {
    return res.status(400).json({ error: 'category_id, product_name, sku and price are required' });
  }

  const [result] = await pool.query(
    `INSERT INTO Product (category_id, product_name, sku, description, price, stock_quantity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [category_id, product_name, sku, description || null, price, stock_quantity || 0]
  );

  res.status(201).json({ product_id: result.insertId });
}));

// PUT /api/products/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category_id, product_name, description, price, stock_quantity } = req.body;

  const [result] = await pool.query(
    `UPDATE Product
     SET category_id = COALESCE(?, category_id),
         product_name = COALESCE(?, product_name),
         description = COALESCE(?, description),
         price = COALESCE(?, price),
         stock_quantity = COALESCE(?, stock_quantity)
     WHERE product_id = ?`,
    [category_id, product_name, description, price, stock_quantity, id]
  );

  if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product updated' });
}));

// DELETE /api/products/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM Product WHERE product_id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
}));

module.exports = router;
