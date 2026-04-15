CREATE DATABASE IF NOT EXISTS valorant_shop;
USE valorant_shop;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','CUSTOMER') DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS (individual skins/items)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category ENUM('SKIN','BUDDY','CARD','SPRAY','OTHER') DEFAULT 'SKIN',
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  rarity ENUM('SELECT','DELUXE','PREMIUM','EXCLUSIVE','ULTRA') DEFAULT 'SELECT',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- BUNDLES
CREATE TABLE IF NOT EXISTS bundles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  discount_percent DECIMAL(5,2) DEFAULT 0.00,
  image_url VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bundle_items (
  bundle_id INT NOT NULL,
  product_id INT NOT NULL,
  PRIMARY KEY(bundle_id, product_id),
  CONSTRAINT fk_bundle_items_bundle FOREIGN KEY(bundle_id) REFERENCES bundles(id) ON DELETE CASCADE,
  CONSTRAINT fk_bundle_items_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- SHOP ROTATION
CREATE TABLE IF NOT EXISTS shop_rotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  is_active TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rotation_products (
  rotation_id INT NOT NULL,
  product_id INT NOT NULL,
  PRIMARY KEY(rotation_id, product_id),
  CONSTRAINT fk_rotation_products_rotation FOREIGN KEY(rotation_id) REFERENCES shop_rotations(id) ON DELETE CASCADE,
  CONSTRAINT fk_rotation_products_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rotation_bundles (
  rotation_id INT NOT NULL,
  bundle_id INT NOT NULL,
  PRIMARY KEY(rotation_id, bundle_id),
  CONSTRAINT fk_rotation_bundles_rotation FOREIGN KEY(rotation_id) REFERENCES shop_rotations(id) ON DELETE CASCADE,
  CONSTRAINT fk_rotation_bundles_bundle FOREIGN KEY(bundle_id) REFERENCES bundles(id) ON DELETE CASCADE
);

-- ORDERS (fake checkout)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('PENDING','PAID_FAKE','CANCELLED') DEFAULT 'PENDING',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  bundle_id INT NULL,
  item_name VARCHAR(120) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY(product_id) REFERENCES products(id),
  CONSTRAINT fk_order_items_bundle FOREIGN KEY(bundle_id) REFERENCES bundles(id)
);

-- BASIC SQL SEED DATA
INSERT INTO products(name, category, price, image_url, rarity)
VALUES
('Prime Vandal', 'SKIN', 17.99, '/uploads/prime-vandal.jpg', 'PREMIUM'),
('Reaver Operator', 'SKIN', 19.99, '/uploads/reaver-operator.jpg', 'PREMIUM'),
('Ion Sheriff', 'SKIN', 12.99, '/uploads/ion-sheriff.jpg', 'DELUXE');

INSERT INTO bundles(name, description, discount_percent, image_url)
VALUES
('Prime Collection', 'Classic + Spectre + Vandal style bundle', 15.00, '/uploads/prime-bundle.jpg');

INSERT INTO bundle_items(bundle_id, product_id)
VALUES (1,1),(1,2);

-- STORED FUNCTION: compute bundle discounted total
DELIMITER $$
CREATE FUNCTION fn_bundle_price(p_bundle_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
  DECLARE v_sum DECIMAL(10,2);
  DECLARE v_discount DECIMAL(5,2);

  SELECT IFNULL(SUM(p.price), 0)
    INTO v_sum
  FROM bundle_items bi
  JOIN products p ON p.id = bi.product_id
  WHERE bi.bundle_id = p_bundle_id;

  SELECT IFNULL(discount_percent, 0)
    INTO v_discount
  FROM bundles
  WHERE id = p_bundle_id;

  RETURN ROUND(v_sum * (1 - (v_discount / 100)), 2);
END$$
DELIMITER ;

-- STORED PROCEDURE: activate current rotation and deactivate others
DELIMITER $$
CREATE PROCEDURE sp_rotate_shop_items()
BEGIN
  UPDATE shop_rotations
  SET is_active = 0;

  UPDATE shop_rotations
  SET is_active = 1
  WHERE NOW() BETWEEN starts_at AND ends_at;
END$$
DELIMITER ;

-- Example rotation
INSERT INTO shop_rotations(starts_at, ends_at, is_active)
VALUES (NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1);

INSERT INTO rotation_products(rotation_id, product_id)
VALUES (1,1),(1,2),(1,3);

INSERT INTO rotation_bundles(rotation_id, bundle_id)
VALUES (1,1);
