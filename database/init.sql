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
('Holo Meridian Vandal', 'SKIN', 2175, 'https://media.valorant-api.com/weaponskins/e06fd704-4171-b5ea-5028-d3befb62107d/displayicon.png', 'ULTRA'),
('Holo Meridian Operator', 'SKIN', 1775, 'https://media.valorant-api.com/weaponskins/bbf8ffb9-49c0-75c0-cc7d-8f8f03a4bd36/displayicon.png', 'PREMIUM'),
('Holo Meridian Sheriff', 'SKIN', 1275, 'https://media.valorant-api.com/weaponskins/19b997bb-461a-fa85-250d-a8b0b8908fea/displayicon.png', 'PREMIUM'),
('Holo Meridian Judge', 'SKIN', 1775, 'https://media.valorant-api.com/weaponskins/309743ac-4288-11dc-d563-88844caa2c4d/displayicon.png', 'PREMIUM'),
('Holo Flare Melee', 'SKIN', 4350, 'https://media.valorant-api.com/weaponskins/ff4bc096-4e6c-b67a-296a-5e814e4c0274/displayicon.png', 'EXCLUSIVE'),
('Blackthorn Vandal', 'SKIN', 1775, 'https://media.valorant-api.com/weaponskins/4f1823dd-4a17-7511-6ac8-4aa28a6a263a/displayicon.png', 'PREMIUM'),
('Blackthorn Guardian', 'SKIN', 1775, 'https://media.valorant-api.com/weaponskins/4047a667-4d1d-bb68-df9e-a09bfa68d934/displayicon.png', 'PREMIUM'),
('Blackthorn Marshal', 'SKIN', 1775, 'https://media.valorant-api.com/weaponskins/7c47be9b-48a5-752e-7229-f7b1668239dd/displayicon.png', 'PREMIUM'),
('Blackthorn Judge', 'SKIN', 1775, 'https://media.valorant-api.com/weaponskins/309743ac-4288-11dc-d563-88844caa2c4d/displayicon.png', 'PREMIUM'),
('Blackthorn Melee', 'SKIN', 4350, 'https://media.valorant-api.com/weaponskins/e37229ed-4ddf-5e7e-e744-8fba60fa2c37/displayicon.png', 'EXCLUSIVE');

INSERT INTO skin_upgrades(product_id, upgrade_name, video_url, sort_order)
VALUES
(1, 'VFX', 'https://valorant.dyn.riotcdn.net/x/videos/release-12.06/32f7797f-4491-e21f-e40b-cfb639df3c97_default_universal.mp4', 1),
(2, 'VFX', 'https://valorant.dyn.riotcdn.net/x/videos/release-12.06/b794b134-42d6-3138-188d-66a940a66304_default_universal.mp4', 1),
(3, 'VFX', 'https://valorant.dyn.riotcdn.net/x/videos/release-12.06/72c8af91-f9f9-4044-801c-3e73ee2f2aa1_default_universal.mp4', 1),
(4, 'VFX', 'https://valorant.dyn.riotcdn.net/x/videos/release-12.06/729c9e7f-43be-dce4-b532-b99995902188_default_universal.mp4', 1);

INSERT INTO bundles(name, description, discount_percent, image_url)
VALUES
('Holo Meridian', 'Vandal, Operator, Sheriff, Judge, Holo Flare Melee', 20.00, 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5c94f47ca632a0f6/67a7be16f9679130d4ffbe74/1920x1080_V25A2_Act2_Battlepass.jpg'),
('Blackthorn', 'Vandal, Guardian, Marshal, Judge, Blackthorn Melee', 18.00, 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blta2ff0fe34b2fd5e6/67f7eb009f852f26510f3fd4/vct25-stage1-article-cover.png'),
('Jellybeam', 'Classic, Bulldog, Marshal, Operator, Jellybeam Melee', 16.00, 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blteee4855ce9cb8807/66ec6afdee4e8d390ce05ddf/1920x1080_v25A1_Act1_Competitive_MapPool.png'),
('SilkLeaf', 'Phantom, Stinger, Ares, Shorty, SilkLeaf Melee', 17.00, 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blte4f865f3af8b0833/66ec6afde9a8f20dd4def4f4/1920x1080_v25A1_Act1_Battlepass.png'),
('Kuronami 2.0', 'Phantom, Operator, Guardian, Ghost, Narukami Melee', 20.00, 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt9948ca8e7c5fd42e/66ff2f8de8f8b96d7f4be293/1920x1080_v25A2_Act2_Kuronami.png');

INSERT INTO bundle_items(bundle_id, product_id)
VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),
(2,6),(2,7),(2,8),(2,9),(2,10),
(3,3),(3,7),(3,8),(3,2),(3,10),
(4,6),(4,7),(4,8),(4,3),(4,10),
(5,6),(5,2),(5,7),(5,3),(5,10);

INSERT INTO app_settings(setting_key, setting_value)
VALUES
('rotation_hours','24'),
('bundle_refresh_hours','24'),
('shop_refresh_cost_vp','500'),
('bundle_refresh_cost_vp','500')
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
VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6);

INSERT INTO rotation_bundles(rotation_id, bundle_id)
VALUES (1,1);
