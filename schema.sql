

DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db;
USE ecommerce_db;



CREATE TABLE Customer (
    customer_id     INT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    password_hash   VARCHAR(255) NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE Address (
    address_id      INT AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT NOT NULL,
    address_line    VARCHAR(150) NOT NULL,
    city            VARCHAR(50)  NOT NULL,
    state           VARCHAR(50),
    zip_code        VARCHAR(15)  NOT NULL,
    country         VARCHAR(50)  NOT NULL,
    is_default      BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
        ON DELETE CASCADE
);



CREATE TABLE Category (
    category_id         INT AUTO_INCREMENT PRIMARY KEY,
    category_name       VARCHAR(100) NOT NULL,
    parent_category_id  INT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES Category(category_id)
        ON DELETE SET NULL
);



CREATE TABLE Supplier (
    supplier_id     INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name   VARCHAR(100) NOT NULL,
    contact_email   VARCHAR(100),
    phone           VARCHAR(20)
);



CREATE TABLE Product (
    product_id      INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT NOT NULL,
    product_name    VARCHAR(150) NOT NULL,
    sku             VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity  INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
);



CREATE TABLE Product_Supplier (
    product_id      INT NOT NULL,
    supplier_id     INT NOT NULL,
    cost_price      DECIMAL(10,2) NOT NULL CHECK (cost_price >= 0),
    PRIMARY KEY (product_id, supplier_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE CASCADE
);



CREATE TABLE Cart (
    cart_id         INT AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
);



CREATE TABLE Cart_Item (
    cart_item_id    INT AUTO_INCREMENT PRIMARY KEY,
    cart_id         INT NOT NULL,
    product_id      INT NOT NULL,
    quantity        INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (cart_id) REFERENCES Cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    UNIQUE (cart_id, product_id)
);



CREATE TABLE Order_Tbl (
    order_id        INT AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT NOT NULL,
    address_id      INT NOT NULL,
    order_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
    status          ENUM('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED')
                        NOT NULL DEFAULT 'PENDING',
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);



CREATE TABLE Order_Item (
    order_item_id   INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    product_id      INT NOT NULL,
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (order_id) REFERENCES Order_Tbl(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);



CREATE TABLE Payment (
    payment_id      INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    payment_method  ENUM('CARD','MOBILE_BANKING','COD','WALLET') NOT NULL,
    payment_date    DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount          DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status          ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (order_id) REFERENCES Order_Tbl(order_id) ON DELETE CASCADE
);



CREATE TABLE Review (
    review_id       INT AUTO_INCREMENT PRIMARY KEY,
    product_id      INT NOT NULL,
    customer_id     INT NOT NULL,
    rating          TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    review_date     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
    UNIQUE (product_id, customer_id)   -- one review per customer per product
);



CREATE INDEX idx_product_category ON Product(category_id);
CREATE INDEX idx_order_customer   ON Order_Tbl(customer_id);
CREATE INDEX idx_orderitem_order  ON Order_Item(order_id);
CREATE INDEX idx_review_product   ON Review(product_id);
