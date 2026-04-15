CREATE DATABASE IF NOT EXISTS valorant_shop;
USE valorant_shop;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','CUSTOMER') DEFAULT 'CUSTOMER',
  vp_balance INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category ENUM('SKIN','BUDDY','CARD','SPRAY','OTHER') DEFAULT 'SKIN',
  price_vp INT NOT NULL,
  image_url VARCHAR(255),
  rarity ENUM('SELECT','DELUXE','PREMIUM','EXCLUSIVE','ULTRA') DEFAULT 'SELECT',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skin_upgrades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  upgrade_name VARCHAR(120) NOT NULL,
  video_url VARCHAR(255),
  sort_order INT DEFAULT 1,
  CONSTRAINT fk_skin_upgrades_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(60) PRIMARY KEY,
  setting_value VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  transaction_type ENUM('PURCHASE','TOPUP') NOT NULL DEFAULT 'PURCHASE',
  payment_method ENUM('vp_wallet','card','paypal','gcash') DEFAULT 'vp_wallet',
  status ENUM('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
  total_vp INT NOT NULL DEFAULT 0,
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
  unit_price_vp INT NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY(product_id) REFERENCES products(id),
  CONSTRAINT fk_order_items_bundle FOREIGN KEY(bundle_id) REFERENCES bundles(id)
);

INSERT INTO products(name, category, price_vp, image_url, rarity)
VALUES
('Storm Maw Judge', 'SKIN', 875, 'https://media.valorant-api.com/weaponskins/309743ac-4288-11dc-d563-88844caa2c4d/displayicon.png', 'PREMIUM'),
('Blades of Primordia', 'SKIN', 4350, 'https://media.valorant-api.com/weaponskins/3e633a9a-482a-30fb-90da-059ff6cd400b/displayicon.png', 'EXCLUSIVE'),
('Convex Sheriff', 'SKIN', 875, 'https://media.valorant-api.com/weaponskins/e8fd8fc3-40ce-3ed1-235a-1c8d9654874f/displayicon.png', 'SELECT'),
('Bolt Knife', 'SKIN', 4350, 'https://media.valorant-api.com/weaponskins/ff4bc096-4e6c-b67a-296a-5e814e4c0274/displayicon.png', 'EXCLUSIVE'),
('Neo Frontier Odin', 'SKIN', 1775, 'https://media.valorant-api.com/weaponskins/bd647d56-4542-19cd-e1ed-4fb429c78cf9/displayicon.png', 'PREMIUM'),
('Glitchpop Odin', 'SKIN', 2175, 'https://media.valorant-api.com/weaponskins/97af88e4-4176-9fa3-4a26-57919443dab7/displayicon.png', 'ULTRA');

INSERT INTO skin_upgrades(product_id, upgrade_name, video_url, sort_order)
VALUES
(1, 'Level 2 VFX', 'https://media.valorant-api.com/weaponskinlevels/83af5e35-4a5a-f8e0-0622-8ebcb8a43f63/streamedvideo.mp4', 1),
(2, 'Level 2 VFX', 'https://media.valorant-api.com/weaponskinlevels/35ad6cdf-4e05-df12-c0e8-e6a8818c4888/streamedvideo.mp4', 1);

INSERT INTO bundles(name, description, discount_percent, image_url)
VALUES
('Run It Back: Lunar', 'Featured collection with mixed premium and exclusive skins.', 20.00, 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5c94f47ca632a0f6/67a7be16f9679130d4ffbe74/1920x1080_V25A2_Act2_Battlepass.jpg'),
('Arcane Arsenal', 'Includes popular Odin and melee picks for rotation refreshes.', 15.00, 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blta2ff0fe34b2fd5e6/67f7eb009f852f26510f3fd4/vct25-stage1-article-cover.png');

INSERT INTO bundle_items(bundle_id, product_id)
VALUES
(1,1),(1,2),(1,3),(1,4),
(2,2),(2,5),(2,6);

INSERT INTO app_settings(setting_key, setting_value)
VALUES
('rotation_hours','24'),
('bundle_refresh_hours','24'),
('shop_refresh_cost_vp','25'),
('bundle_refresh_cost_vp','40')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

DELIMITER $$
CREATE FUNCTION fn_bundle_price(p_bundle_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE v_sum INT;
  DECLARE v_discount DECIMAL(5,2);

  SELECT IFNULL(SUM(p.price_vp), 0)
    INTO v_sum
  FROM bundle_items bi
  JOIN products p ON p.id = bi.product_id
  WHERE bi.bundle_id = p_bundle_id;

  SELECT IFNULL(discount_percent, 0)
    INTO v_discount
  FROM bundles
  WHERE id = p_bundle_id;

  RETURN ROUND(v_sum * (1 - (v_discount / 100)), 0);
END$$
DELIMITER ;

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

INSERT INTO shop_rotations(starts_at, ends_at, is_active)
VALUES (NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), 1);

INSERT INTO rotation_products(rotation_id, product_id)
VALUES (1,1),(1,2),(1,3),(1,4);

INSERT INTO rotation_bundles(rotation_id, bundle_id)
VALUES (1,1);
