-- Valorant Hybrid Shop Replica Schema (XAMPP/phpMyAdmin)
CREATE DATABASE IF NOT EXISTS valorant_hybrid_shop;
USE valorant_hybrid_shop;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS owned_skins;
DROP TABLE IF EXISTS skin_upgrade_costs;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users wallet
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  vp_balance INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Cost table used by CalculateUpgradeCost for each target level
CREATE TABLE skin_upgrade_costs (
  skin_id VARCHAR(80) NOT NULL,
  target_level TINYINT NOT NULL,
  vp_cost INT NOT NULL,
  PRIMARY KEY (skin_id, target_level)
) ENGINE=InnoDB;

-- Tracks highest unlocked level per user/skin
CREATE TABLE owned_skins (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skin_id VARCHAR(80) NOT NULL,
  level_unlocked TINYINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_skin (user_id, skin_id),
  CONSTRAINT fk_owned_skins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Purchase log (top-up + upgrade + failures)
CREATE TABLE transactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skin_id VARCHAR(80) NULL,
  action_type ENUM('UPGRADE_PURCHASE', 'TOP_UP', 'FAILED_UPGRADE') NOT NULL,
  level_purchased TINYINT NULL,
  vp_cost INT NOT NULL,
  status ENUM('SUCCESS', 'FAILED') NOT NULL,
  detail VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed: users
INSERT INTO users (username, vp_balance) VALUES
('demo_player', 1200),
('admin', 999999);

-- Seed: Holo Meridian Operator upgrade ladder
-- Incremental model (L1->L2, L2->L3, L3->L4)
INSERT INTO skin_upgrade_costs (skin_id, target_level, vp_cost) VALUES
('holo-meridian-operator', 2, 300),
('holo-meridian-operator', 3, 400),
('holo-meridian-operator', 4, 500),
('reaver-vandal', 2, 300),
('reaver-vandal', 3, 400),
('reaver-vandal', 4, 500);

-- Seed ownership (default Level 1 unlocked)
INSERT INTO owned_skins (user_id, skin_id, level_unlocked) VALUES
(1, 'holo-meridian-operator', 1),
(1, 'reaver-vandal', 1);

-- Function: CheckTotalVP(user)
DROP FUNCTION IF EXISTS CheckTotalVP;
DELIMITER $$
CREATE FUNCTION CheckTotalVP(p_user_id INT)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_vp INT;

  SELECT vp_balance
    INTO v_vp
  FROM users
  WHERE id = p_user_id
  LIMIT 1;

  RETURN IFNULL(v_vp, 0);
END $$
DELIMITER ;

-- Function: CalculateUpgradeCost(user, skin, target level)
-- Sum incremental costs for levels above current unlocked up to target.
DROP FUNCTION IF EXISTS CalculateUpgradeCost;
DELIMITER $$
CREATE FUNCTION CalculateUpgradeCost(
  p_user_id INT,
  p_skin_id VARCHAR(80),
  p_target_level TINYINT
)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_current_level TINYINT DEFAULT 1;
  DECLARE v_total_cost INT DEFAULT 0;

  SELECT IFNULL(level_unlocked, 1)
    INTO v_current_level
  FROM owned_skins
  WHERE user_id = p_user_id
    AND skin_id = p_skin_id
  LIMIT 1;

  IF p_target_level <= v_current_level THEN
    RETURN 0;
  END IF;

  SELECT IFNULL(SUM(vp_cost), 0)
    INTO v_total_cost
  FROM skin_upgrade_costs
  WHERE skin_id = p_skin_id
    AND target_level > v_current_level
    AND target_level <= p_target_level;

  RETURN v_total_cost;
END $$
DELIMITER ;

-- Procedure: ProcessUpgradePurchase(user, skin, level, vp_cost)
DROP PROCEDURE IF EXISTS ProcessUpgradePurchase;
DELIMITER $$
CREATE PROCEDURE ProcessUpgradePurchase(
  IN p_user_id INT,
  IN p_skin_id VARCHAR(80),
  IN p_level TINYINT,
  IN p_vp_cost INT
)
main: BEGIN
  DECLARE v_current_vp INT DEFAULT 0;
  DECLARE v_expected_cost INT DEFAULT 0;

  IF p_level < 2 OR p_level > 4 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid target level. Allowed range is 2-4.';
  END IF;

  START TRANSACTION;

  SELECT vp_balance
    INTO v_current_vp
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_vp IS NULL THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found.';
  END IF;

  -- lock ownership row and ensure baseline Level 1 row exists
  INSERT INTO owned_skins (user_id, skin_id, level_unlocked)
  VALUES (p_user_id, p_skin_id, 1)
  ON DUPLICATE KEY UPDATE level_unlocked = level_unlocked;

  SELECT CalculateUpgradeCost(p_user_id, p_skin_id, p_level)
    INTO v_expected_cost;

  IF p_vp_cost <> v_expected_cost THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Client vp_cost mismatch with calculated upgrade cost.';
  END IF;

  IF v_expected_cost <= 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Requested level is already unlocked.';
  END IF;

  IF v_current_vp < v_expected_cost THEN
    INSERT INTO transactions (user_id, skin_id, action_type, level_purchased, vp_cost, status, detail)
    VALUES (p_user_id, p_skin_id, 'FAILED_UPGRADE', p_level, v_expected_cost, 'FAILED', 'Insufficient VP');

    COMMIT;

    SELECT 'FAILED' AS status,
           'Insufficient VP balance.' AS message,
           CheckTotalVP(p_user_id) AS remaining_vp,
           v_expected_cost AS required_vp;
    LEAVE main;
  END IF;

  UPDATE users
  SET vp_balance = vp_balance - v_expected_cost
  WHERE id = p_user_id;

  UPDATE owned_skins
  SET level_unlocked = GREATEST(level_unlocked, p_level)
  WHERE user_id = p_user_id
    AND skin_id = p_skin_id;

  INSERT INTO transactions (user_id, skin_id, action_type, level_purchased, vp_cost, status, detail)
  VALUES (p_user_id, p_skin_id, 'UPGRADE_PURCHASE', p_level, v_expected_cost, 'SUCCESS', 'Upgrade unlocked');

  COMMIT;

  SELECT 'SUCCESS' AS status,
         'Upgrade unlocked successfully.' AS message,
         CheckTotalVP(p_user_id) AS remaining_vp,
         v_expected_cost AS charged_vp;
END $$
DELIMITER ;
