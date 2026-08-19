const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/orders?customer_id=
router.get('/', asyncHandler(async (req, res) => {
  const { customer_id } = req.query;
  const params = [];
  let sql = `
    SELECT o.order_id, o.order_date, o.status, o.total_amount,
           cu.first_name, cu.last_name
    FROM Order_Tbl o
    JOIN Customer cu ON o.customer_id = cu.customer_id
  `;
  if (customer_id) {
    sql += ' WHERE o.customer_id = ?';
    params.push(customer_id);
  }
  sql += ' ORDER BY o.order_date DESC';

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

// GET /api/orders/:id
// Query 3 from queries.sql — full order detail: order -> line items -> product names
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [[order]] = await pool.query(
    `SELECT o.order_id, o.order_date, o.status, o.total_amount,
            cu.customer_id, cu.first_name, cu.last_name, cu.email,
            a.address_line, a.city, a.state, a.zip_code, a.country
     FROM Order_Tbl o
     JOIN Customer cu ON o.customer_id = cu.customer_id
     JOIN Address a   ON o.address_id = a.address_id
     WHERE o.order_id = ?`,
    [id]
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const [items] = await pool.query(
    `SELECT oi.order_item_id, p.product_id, p.product_name, oi.quantity, oi.unit_price,
            (oi.quantity * oi.unit_price) AS line_total
     FROM Order_Item oi
     JOIN Product p ON oi.product_id = p.product_id
     WHERE oi.order_id = ?`,
    [id]
  );

  const [payments] = await pool.query('SELECT * FROM Payment WHERE order_id = ?', [id]);

  res.json({ ...order, items, payments });
}));

// POST /api/orders  { customer_id, address_id, payment_method }
// Places an order from the customer's current cart in a single DB transaction:
// creates the order + order items, decrements stock, records payment, empties the cart.
router.post('/', asyncHandler(async (req, res) => {
  const { customer_id, address_id, payment_method } = req.body;

  if (!customer_id || !address_id || !payment_method) {
    return res.status(400).json({ error: 'customer_id, address_id and payment_method are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[cart]] = await conn.query(
      'SELECT cart_id FROM Cart WHERE customer_id = ? ORDER BY cart_id DESC LIMIT 1',
      [customer_id]
    );
    if (!cart) throw Object.assign(new Error('Cart is empty'), { status: 400 });

    const [cartItems] = await conn.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity, p.product_name
       FROM Cart_Item ci
       JOIN Product p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ?`,
      [cart.cart_id]
    );
    if (cartItems.length === 0) throw Object.assign(new Error('Cart is empty'), { status: 400 });

    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        throw Object.assign(
          new Error(`Not enough stock for "${item.product_name}" (have ${item.stock_quantity}, need ${item.quantity})`),
          { status: 409 }
        );
      }
    }

    const totalAmount = cartItems.reduce((sum, i) => sum + i.quantity * Number(i.price), 0);

    const [orderResult] = await conn.query(
      `INSERT INTO Order_Tbl (customer_id, address_id, status, total_amount)
       VALUES (?, ?, 'PENDING', ?)`,
      [customer_id, address_id, totalAmount]
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await conn.query(
        `INSERT INTO Order_Item (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
      await conn.query(
        'UPDATE Product SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    await conn.query(
      `INSERT INTO Payment (order_id, payment_method, amount, status)
       VALUES (?, ?, ?, 'SUCCESS')`,
      [orderId, payment_method, totalAmount]
    );

    await conn.query('DELETE FROM Cart_Item WHERE cart_id = ?', [cart.cart_id]);

    await conn.commit();
    res.status(201).json({ order_id: orderId, total_amount: totalAmount });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

// PUT /api/orders/:id/status  { status }
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
  }

  const [result] = await pool.query('UPDATE Order_Tbl SET status = ? WHERE order_id = ?', [status, req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ message: 'Order status updated' });
}));

module.exports = router;
