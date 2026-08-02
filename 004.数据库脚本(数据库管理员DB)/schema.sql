-- ================================================
-- 留白记账 · Ink & Balance — 数据库设计
-- 基于 PRD V1.0.3
-- 数据库版本：V1.0.3
-- 创建日期：2026-07-31
-- ================================================

-- --------------------------------------------------------
-- 1. 用户表 (users)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(20) NOT NULL COMMENT '用户名/昵称，4-20位字符',
    `phone` VARCHAR(11) NOT NULL COMMENT '手机号，唯一登录标识',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt加密后的密码',
    `avatar_url` VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '账号状态：1正常，0禁用',
    `lock_until` DATETIME DEFAULT NULL COMMENT '锁定截止时间，为空表示未锁定',
    `login_fail_count` TINYINT NOT NULL DEFAULT 0 COMMENT '连续登录失败次数',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- --------------------------------------------------------
-- 2. 认证Token表 (auth_tokens)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `auth_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Token记录ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
    `token` VARCHAR(255) NOT NULL COMMENT 'Token值',
    `device_info` VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
    `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    `expires_at` DATETIME NOT NULL COMMENT '过期时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_token` (`token`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_expires_at` (`expires_at`),
    CONSTRAINT `fk_auth_tokens_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录Token表（记住登录状态）';

-- --------------------------------------------------------
-- 3. 登录日志表 (login_logs)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `login_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联用户ID',
    `phone` VARCHAR(11) DEFAULT NULL COMMENT '登录时输入的手机号',
    `status` TINYINT NOT NULL COMMENT '登录结果：1成功，0失败',
    `fail_reason` VARCHAR(100) DEFAULT NULL COMMENT '失败原因',
    `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    `device_info` VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_phone` (`phone`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- --------------------------------------------------------
-- 4. 验证码表 (verification_codes)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `verification_codes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '验证码ID',
    `phone` VARCHAR(11) NOT NULL COMMENT '手机号',
    `type` VARCHAR(20) NOT NULL COMMENT '验证码类型：password_reset=找回密码，bind_phone=绑定手机',
    `code` VARCHAR(10) NOT NULL COMMENT '验证码',
    `used` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已使用：0未使用，1已使用',
    `expires_at` DATETIME NOT NULL COMMENT '过期时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_phone_type` (`phone`, `type`),
    KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证码表';

-- --------------------------------------------------------
-- 5. 账本表 (accounts)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账本ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '所属用户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '账本名称',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT '货币代码：CNY人民币，USD美元等',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '账本图标',
    `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '当前余额',
    `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否为默认账本：0否，1是',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常，0删除',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账本表';

-- --------------------------------------------------------
-- 6. 分类表 (categories)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属用户ID，NULL表示系统预设分类',
    `name` VARCHAR(30) NOT NULL COMMENT '分类名称',
    `icon` VARCHAR(50) NOT NULL COMMENT '分类图标名称',
    `type` TINYINT NOT NULL COMMENT '类型：1支出，2收入',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序，数字越小越靠前',
    `is_system` TINYINT NOT NULL DEFAULT 0 COMMENT '是否系统预设：0自定义，1系统预设',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常，0删除',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`),
    KEY `idx_user_type_name` (`user_id`, `type`, `name`),
    CONSTRAINT `fk_categories_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- --------------------------------------------------------
-- 7. 账单表 (records)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账单ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '所属用户ID',
    `account_id` BIGINT UNSIGNED NOT NULL COMMENT '所属账本ID',
    `category_id` BIGINT UNSIGNED NOT NULL COMMENT '所属分类ID',
    `type` TINYINT NOT NULL COMMENT '账单类型：1支出，2收入',
    `amount` DECIMAL(15,2) NOT NULL COMMENT '金额，保留两位小数',
    `note` VARCHAR(100) DEFAULT NULL COMMENT '备注，最多100字',
    `record_date` DATE NOT NULL COMMENT '账单日期',
    `record_time` TIME NOT NULL COMMENT '账单时间',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常，0删除',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_account_id` (`account_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_type` (`type`),
    KEY `idx_record_date` (`record_date`),
    KEY `idx_user_date` (`user_id`, `record_date`),
    KEY `idx_user_type_date` (`user_id`, `type`, `record_date`),
    CONSTRAINT `fk_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_records_account_id` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_records_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账单表';

-- --------------------------------------------------------
-- 8. 预算表 (budgets)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `budgets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '预算ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '所属用户ID',
    `account_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属账本ID，NULL表示跨账本预算',
    `category_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属分类ID，NULL表示总预算',
    `month` VARCHAR(7) NOT NULL COMMENT '预算月份，格式：YYYY-MM',
    `amount` DECIMAL(15,2) NOT NULL COMMENT '预算金额',
    `warn_percent` TINYINT NOT NULL DEFAULT 80 COMMENT '预警百分比，默认80%',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常，0删除',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_account_category_month` (`user_id`, `account_id`, `category_id`, `month`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_month` (`month`),
    CONSTRAINT `fk_budgets_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算表';

-- --------------------------------------------------------
-- 9. 数据备份记录表 (backups)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `backups` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '备份记录ID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '所属用户ID',
    `type` VARCHAR(20) NOT NULL COMMENT '备份类型：full全量，partial增量',
    `file_url` VARCHAR(512) NOT NULL COMMENT '备份文件URL或路径',
    `file_size` BIGINT UNSIGNED DEFAULT NULL COMMENT '文件大小（字节）',
    `record_count` INT DEFAULT NULL COMMENT '备份包含的账单数量',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1成功，0失败',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '备份时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_backups_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据备份记录表';

-- ================================================
-- 初始化数据
-- ================================================

-- 插入系统预设支出分类
INSERT INTO `categories` (`name`, `icon`, `type`, `sort_order`, `is_system`) VALUES
('餐饮', 'restaurant', 1, 1, 1),
('交通', 'directions_bus', 1, 2, 1),
('购物', 'shopping_bag', 1, 3, 1),
('居住', 'home', 1, 4, 1),
('娱乐', 'movie', 1, 5, 1),
('医疗', 'health_and_safety', 1, 6, 1),
('教育', 'school', 1, 7, 1),
('人情', 'favorite', 1, 8, 1),
('宠物', 'pets', 1, 9, 1),
('旅行', 'flight', 1, 10, 1),
('运动', 'fitness_center', 1, 11, 1),
('订阅', 'subscriptions', 1, 12, 1),
('其他支出', 'more_horiz', 1, 99, 1);

-- 插入系统预设收入分类
INSERT INTO `categories` (`name`, `icon`, `type`, `sort_order`, `is_system`) VALUES
('工资', 'payments', 2, 1, 1),
('奖金', 'redeem', 2, 2, 1),
('兼职', 'account_balance_wallet', 2, 3, 1),
('投资收益', 'trending_up', 2, 4, 1),
('红包', 'card_giftcard', 2, 5, 1),
('其他收入', 'more_horiz', 2, 99, 1);

-- ================================================
-- 视图定义
-- ================================================

-- 月度账单汇总视图
CREATE OR REPLACE VIEW `v_monthly_summary` AS
SELECT
    r.user_id,
    DATE_FORMAT(r.record_date, '%Y-%m') AS month,
    r.type,
    SUM(r.amount) AS total_amount,
    COUNT(*) AS record_count
FROM records r
WHERE r.status = 1
GROUP BY r.user_id, DATE_FORMAT(r.record_date, '%Y-%m'), r.type;

-- 预算执行进度视图
CREATE OR REPLACE VIEW `v_budget_progress` AS
SELECT
    b.id AS budget_id,
    b.user_id,
    b.account_id,
    b.category_id,
    b.month,
    b.amount AS budget_amount,
    b.warn_percent,
    COALESCE(SUM(r.amount), 0) AS spent_amount,
    COALESCE(SUM(r.amount), 0) / b.amount * 100 AS used_percent,
    CASE
        WHEN COALESCE(SUM(r.amount), 0) / b.amount * 100 >= 100 THEN 'exceeded'
        WHEN COALESCE(SUM(r.amount), 0) / b.amount * 100 >= b.warn_percent THEN 'warning'
        ELSE 'normal'
    END AS status
FROM budgets b
LEFT JOIN records r ON r.user_id = b.user_id
    AND r.account_id = b.account_id
    AND r.category_id = b.category_id
    AND r.type = 1
    AND r.status = 1
    AND DATE_FORMAT(r.record_date, '%Y-%m') = b.month
WHERE b.status = 1
GROUP BY b.id, b.user_id, b.account_id, b.category_id, b.month, b.amount, b.warn_percent;

-- ================================================
-- 索引优化建议
-- ================================================
-- 以下索引可在数据量增长后根据查询分析添加
-- CREATE INDEX idx_records_user_type_category ON records(user_id, type, category_id);
-- CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);

-- ================================================
-- 存储过程示例：清理过期Token
-- ================================================
DELIMITER $$
CREATE PROCEDURE `cleanup_expired_tokens`()
BEGIN
    DELETE FROM auth_tokens WHERE expires_at < NOW();
END$$
DELIMITER ;

-- ================================================
-- 存储过程示例：清理过期验证码
-- ================================================
DELIMITER $$
CREATE PROCEDURE `cleanup_expired_codes`()
BEGIN
    DELETE FROM verification_codes WHERE expires_at < NOW() OR used = 1;
END$$
DELIMITER ;

-- ================================================
-- 触发器示例：账单新增时更新账本余额
-- ================================================
DELIMITER $$
CREATE TRIGGER `trg_records_after_insert`
AFTER INSERT ON `records` FOR EACH ROW
BEGIN
    IF NEW.type = 1 THEN
        -- 支出，减少余额
        UPDATE accounts
        SET balance = balance - NEW.amount
        WHERE id = NEW.account_id;
    ELSE
        -- 收入，增加余额
        UPDATE accounts
        SET balance = balance + NEW.amount
        WHERE id = NEW.account_id;
    END IF;
END$$
DELIMITER ;

-- ================================================
-- 触发器示例：账单删除时回滚账本余额
-- ================================================
DELIMITER $$
CREATE TRIGGER `trg_records_after_delete`
AFTER DELETE ON `records` FOR EACH ROW
BEGIN
    IF OLD.type = 1 THEN
        -- 支出，恢复余额
        UPDATE accounts
        SET balance = balance + OLD.amount
        WHERE id = OLD.account_id;
    ELSE
        -- 收入，减少余额
        UPDATE accounts
        SET balance = balance - OLD.amount
        WHERE id = OLD.account_id;
    END IF;
END$$
DELIMITER ;
