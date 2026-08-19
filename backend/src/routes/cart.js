const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Get (or lazily create) the single active cart for a customer
async function getOrCreateCartId(customerId) {
  const [[existing]] = await pool.query(
    'SELECT cart_id FROM Cart WHERE customer_id = ? ORDER BY cart_id DESC LIMIT 1',
    [customerId]
  );
  if (existing) return existing.cart_id;

  const [result] = await pool.query('INSERT INTO Cart (customer_id) VALUES (?)', [customerId]);
  return result.insertId;
}

// GET /api/cart/:customerId
// Query 8 from queries.sql — cart contents with per-line subtotal + cart total
router.get('/:customerId', asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const cartId = await getOrCreateCartId(customerId);

  const [items] = await pool.query(
    `SELECT ci.cart_item_id, p.product_id, p.product_name, p.price,
            ci.quantity, (ci.quantity * p.price) AS subtotal
     FROM Cart_Item ci
     JOIN Product p ON ci.product_id = p.product_id
     WHERE ci.cart_id = ?
     ORDER BY ci.cart_item_id`,
    [cartId]
  );

  const total = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
  res.json({ cart_id: cartId, items, total });
}));

// POST /api/cart/:customerId/items  { product_id, quantity }
router.post('/:customerId/items', asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'product_id and a positive quantity are required' });
  }

  const cartId = await getOrCreateCartId(customerId);

  // Upsert: bump quantity if the product's already in the cart
  await pool.query(
    `INSERT INTO Cart_Item (cart_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [cartId, product_id, quantity]
  );

  res.status(201).json({ message: 'Item added to cart' });
}));

// PUT /api/cart/items/:cartItemId  { quantity }
router.put('/items/:cartItemId', asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'A positive quantity is required' });
  }

  const [result] = await pool.query(
    'UPDATE Cart_Item SET quantity = ? WHERE cart_item_id = ?',
    [quantity, req.params.cartItemId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Cart item not found' });
  res.json({ message: 'Cart item updated' });
}));

// DELETE /api/cart/items/:cartItemId
router.delete('/items/:cartItemId', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM Cart_Item WHERE cart_item_id = ?', [req.params.cartItemId]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Cart item not found' });
  res.json({ message: 'Cart item removed' });
}));

module.exports = router;
