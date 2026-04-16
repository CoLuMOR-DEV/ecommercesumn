-- Valorant Shop Replica (MySQL 8+, XAMPP/phpMyAdmin compatible)
CREATE DATABASE IF NOT EXISTS valorant_shop_replica;
USE valorant_shop_replica;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS shop_items;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1) USERS: player wallet and auth seed
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  vp_balance INT NOT NULL DEFAULT 0,
  role ENUM('player', 'admin') NOT NULL DEFAULT 'player',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2) SHOP ITEMS: mirrors Valorant offers fetched from unofficial Valorant API
CREATE TABLE shop_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_uuid VARCHAR(64) NOT NULL UNIQUE,
  item_name VARCHAR(120) NOT NULL,
  item_type ENUM('skin', 'bundle', 'vp_pack') NOT NULL DEFAULT 'skin',
  weapon_name VARCHAR(80) NULL,
  tier_name VARCHAR(50) NULL,
  image_url VARCHAR(500) NULL,
  chroma_image_url VARCHAR(500) NULL,
  icon_url VARCHAR(500) NULL,
  vp_cost INT NOT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3) TRANSACTIONS: fake checkouts for admin panel audit
CREATE TABLE transactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  vp_cost INT NOT NULL,
  status ENUM('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  failure_reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_transactions_item FOREIGN KEY (item_id) REFERENCES shop_items(id)
) ENGINE=InnoDB;

-- Seed users
INSERT INTO users (username, password_hash, vp_balance, role) VALUES
('admin', '$2y$10$hardcodedDemoHashReplaceInProd', 999999, 'admin'),
('demo_player', '$2y$10$hardcodedDemoHashReplaceInProd', 5350, 'player');

-- Seed shop items
INSERT INTO shop_items (
  item_uuid, item_name, item_type, weapon_name, tier_name,
  image_url, chroma_image_url, icon_url, vp_cost, is_featured
) VALUES
('bundle-rgx-2026', 'RGX 11z Pro Bundle', 'bundle', NULL, 'Exclusive',
 'https://media.valorant-api.com/bundles/rgx-bundle/displayicon.png',
 'https://media.valorant-api.com/bundles/rgx-bundle/displayicon2.png',
 'https://media.valorant-api.com/bundles/rgx-bundle/displayiconsmall.png',
 8700, 1),
('skin-reaver-vandal', 'Reaver Vandal', 'skin', 'Vandal', 'Premium',
 'https://media.valorant-api.com/weaponskins/reaver-vandal/displayicon.png',
 'https://media.valorant-api.com/weaponskins/reaver-vandal/chromadisplayicon.png',
 'https://media.valorant-api.com/weaponskins/reaver-vandal/displayicon.png',
 1775, 0),
('skin-prime-phantom', 'Prime Phantom', 'skin', 'Phantom', 'Premium',
 'https://media.valorant-api.com/weaponskins/prime-phantom/displayicon.png',
 'https://media.valorant-api.com/weaponskins/prime-phantom/chromadisplayicon.png',
 'https://media.valorant-api.com/weaponskins/prime-phantom/displayicon.png',
 1775, 0);

-- Stored Function: CheckUserVP(user_id, required_vp)
-- Returns 1 if enough VP, otherwise 0
DROP FUNCTION IF EXISTS CheckUserVP;
DELIMITER $$
CREATE FUNCTION CheckUserVP(p_user_id INT, p_required_vp INT)
RETURNS TINYINT
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_balance INT DEFAULT 0;

  SELECT vp_balance
    INTO v_balance
  FROM users
  WHERE id = p_user_id
  LIMIT 1;

  IF v_balance IS NULL THEN
    RETURN 0;
  END IF;

  IF v_balance >= p_required_vp THEN
    RETURN 1;
  END IF;

  RETURN 0;
END $$
DELIMITER ;

-- Stored Procedure: ProcessFakeCheckout(user_id, item_id, vp_cost)
-- Deducts VP when available and logs every attempt in transactions
DROP PROCEDURE IF EXISTS ProcessFakeCheckout;
DELIMITER $$
CREATE PROCEDURE ProcessFakeCheckout(
  IN p_user_id INT,
  IN p_item_id INT,
  IN p_vp_cost INT
)
proc_main: BEGIN
  DECLARE v_has_vp TINYINT DEFAULT 0;

  START TRANSACTION;

  -- Row lock for safe concurrent deductions
  SELECT CheckUserVP(p_user_id, p_vp_cost)
    INTO v_has_vp
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_has_vp = 1 THEN
    UPDATE users
      SET vp_balance = vp_balance - p_vp_cost
    WHERE id = p_user_id;

    INSERT INTO transactions (user_id, item_id, vp_cost, status)
    VALUES (p_user_id, p_item_id, p_vp_cost, 'SUCCESS');

    COMMIT;

    SELECT 'SUCCESS' AS checkout_status,
           'Purchase completed.' AS message,
           (SELECT vp_balance FROM users WHERE id = p_user_id) AS remaining_vp;
  ELSE
    INSERT INTO transactions (user_id, item_id, vp_cost, status, failure_reason)
    VALUES (p_user_id, p_item_id, p_vp_cost, 'FAILED', 'Insufficient VP balance');

    COMMIT;

    SELECT 'FAILED' AS checkout_status,
           'Insufficient VP balance.' AS message,
           (SELECT vp_balance FROM users WHERE id = p_user_id) AS remaining_vp;
  END IF;
END $$
DELIMITER ;
