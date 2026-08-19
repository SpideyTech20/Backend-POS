USE test;


-- PRODUCTS TABLE

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL
);

INSERT INTO products (name, price, stock)
VALUES
('Running Shoes', 5500.00, 15),
('Smartwatch', 8999.00, 8),
('Running Socks', 350.00, 50),
('Running Shirt', 650.00, 30),
('Running Shorts', 750.00, 25),
('Hydration Bottle', 500.00, 20),
('Running Cap', 450.00, 18),
('Energy Gel', 120.00, 100);

-- USERS TABLE

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_email (email)
);