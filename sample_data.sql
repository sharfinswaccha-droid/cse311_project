-- ============================================================
-- E-Commerce Database — Sample Data (DML)
-- Run after schema.sql
-- ============================================================

USE ecommerce_db;

-- Customers
INSERT INTO Customer (first_name, last_name, email, phone, password_hash) VALUES
('Jane', 'Doe', 'jane.doe@mail.com', '01700000001', 'hash_1'),
('Rahim', 'Uddin', 'rahim.uddin@mail.com', '01700000002', 'hash_2'),
('Ayesha', 'Khan', 'ayesha.khan@mail.com', '01700000003', 'hash_3');

-- Addresses
INSERT INTO Address (customer_id, address_line, city, state, zip_code, country, is_default) VALUES
(1, '12 Elm St', 'Dhaka', 'Dhaka Division', '1207', 'Bangladesh', TRUE),
(2, '45 Gulshan Ave', 'Dhaka', 'Dhaka Division', '1212', 'Bangladesh', TRUE),
(3, '9 Chittagong Rd', 'Chittagong', 'Chattogram Division', '4000', 'Bangladesh', TRUE);

-- Categories (with one sub-category)
INSERT INTO Category (category_name, parent_category_id) VALUES
('Electronics', NULL),
('Computer Accessories', 1),
('Books', NULL);

-- Suppliers
INSERT INTO Supplier (supplier_name, contact_email, phone) VALUES
('TechSource Ltd', 'sales@techsource.com', '02-9000001'),
('BookHouse BD', 'contact@bookhouse.com', '02-9000002');

-- Products
INSERT INTO Product (category_id, product_name, sku, description, price, stock_quantity) VALUES
(2, 'Wireless Mouse', 'SKU-MOUSE-01', 'Ergonomic 2.4GHz wireless mouse', 12.50, 150),
(2, 'Mechanical Keyboard', 'SKU-KEYB-01', 'RGB backlit mechanical keyboard', 45.00, 80),
(1, 'Bluetooth Speaker', 'SKU-SPKR-01', 'Portable speaker, 10W', 30.00, 60),
(3, 'Database Systems Textbook', 'SKU-BOOK-01', 'Intro to database design', 25.00, 40);

-- Product-Supplier relationships
INSERT INTO Product_Supplier (product_id, supplier_id, cost_price) VALUES
(1, 1, 8.00),
(2, 1, 30.00),
(3, 1, 20.00),
(4, 2, 15.00);

-- Cart for Jane
INSERT INTO Cart (customer_id) VALUES (1);
INSERT INTO Cart_Item (cart_id, product_id, quantity) VALUES
(1, 1, 2),
(1, 4, 1);

-- Order for Jane (mouse x2, keyboard x1)
INSERT INTO Order_Tbl (customer_id, address_id, status, total_amount) VALUES
(1, 1, 'DELIVERED', 70.00);

INSERT INTO Order_Item (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 2, 12.50),
(1, 2, 1, 45.00);

-- Payment for that order
INSERT INTO Payment (order_id, payment_method, amount, status) VALUES
(1, 'CARD', 70.00, 'SUCCESS');

-- Review
INSERT INTO Review (product_id, customer_id, rating, comment) VALUES
(1, 1, 5, 'Great mouse, very responsive!'),
(2, 1, 4, 'Good keyboard, a bit loud when typing.');
