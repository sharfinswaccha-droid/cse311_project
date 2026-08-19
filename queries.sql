-- ============================================================
-- E-Commerce Database — Example Queries
-- Run after schema.sql and sample_data.sql
-- ============================================================

USE ecommerce_db;

-- 1. List all products with their category name
SELECT p.product_name, p.price, c.category_name
FROM Product p
JOIN Category c ON p.category_id = c.category_id;

-- 2. Total amount spent by each customer (only DELIVERED orders)
SELECT cu.first_name, cu.last_name, SUM(o.total_amount) AS total_spent
FROM Customer cu
JOIN Order_Tbl o ON cu.customer_id = o.customer_id
WHERE o.status = 'DELIVERED'
GROUP BY cu.customer_id, cu.first_name, cu.last_name
ORDER BY total_spent DESC;

-- 3. Full order detail: order -> line items -> product names
SELECT o.order_id, cu.first_name, p.product_name, oi.quantity, oi.unit_price,
       (oi.quantity * oi.unit_price) AS line_total
FROM Order_Tbl o
JOIN Customer cu   ON o.customer_id = cu.customer_id
JOIN Order_Item oi ON o.order_id = oi.order_id
JOIN Product p     ON oi.product_id = p.product_id
ORDER BY o.order_id;

-- 4. Average rating per product
SELECT p.product_name, ROUND(AVG(r.rating), 2) AS avg_rating, COUNT(r.review_id) AS review_count
FROM Product p
LEFT JOIN Review r ON p.product_id = r.product_id
GROUP BY p.product_id, p.product_name;

-- 5. Products that are low in stock (below 50 units)
SELECT product_name, stock_quantity
FROM Product
WHERE stock_quantity < 50;

-- 6. Customers who have never placed an order (subquery)
SELECT first_name, last_name, email
FROM Customer
WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM Order_Tbl);

-- 7. Best-selling product by total quantity ordered
SELECT p.product_name, SUM(oi.quantity) AS total_sold
FROM Order_Item oi
JOIN Product p ON oi.product_id = p.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_sold DESC
LIMIT 1;

-- 8. Current contents of each customer's cart, with running subtotal
SELECT cu.first_name, p.product_name, ci.quantity, p.price,
       (ci.quantity * p.price) AS subtotal
FROM Cart c
JOIN Customer cu   ON c.customer_id = cu.customer_id
JOIN Cart_Item ci  ON c.cart_id = ci.cart_id
JOIN Product p     ON ci.product_id = p.product_id;

-- 9. Suppliers and the products they provide, with cost price
SELECT s.supplier_name, p.product_name, ps.cost_price
FROM Supplier s
JOIN Product_Supplier ps ON s.supplier_id = ps.supplier_id
JOIN Product p ON ps.product_id = p.product_id;

-- 10. Payment status summary (count of orders per status)
SELECT status, COUNT(*) AS num_payments, SUM(amount) AS total_amount
FROM Payment
GROUP BY status;
