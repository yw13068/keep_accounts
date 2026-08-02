# 数据库设计文档

**项目名称：** 留白记账 · Ink & Balance
**数据库版本：** V1.0.3
**基于文档：** PRD 记账产品 V1.0.3
**创建日期：** 2026-07-31

---

## 1. 数据库设计原则

### 1.1 命名规范

| 对象 | 命名规范 | 示例 |
|------|----------|------|
| 表名 | 小写下划线，复数形式 | `users`, `records` |
| 字段名 | 小写下划线 | `user_id`, `record_date` |
| 主键 | `id` | 自增主键 |
| 外键 | `xxx_id` | `user_id`, `category_id` |
| 时间戳 | `_at` | `created_at`, `updated_at` |
| 软删除 | `deleted_at` | 删除时间字段 |
| 布尔值 | `is_` / `status` | `is_default`, `status` |

### 1.2 存储引擎

- **InnoDB**：支持事务，行级锁，外键约束
- **字符集**：`utf8mb4`（支持 emoji 和特殊字符）
- **排序规则**：`utf8mb4_unicode_ci`

---

## 2. 数据模型 ER 图

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   users    │───1:N──│   auth_tokens   │       │   users    │
│  用户表    │         │   登录Token表   │       │  用户表    │
└─────┬───────┘         └─────────────────┘       └──────┬──────┘
      │                                              │
      │ 1:N                                         │
      │                                             │
      │              ┌─────────────────┐            │
      ├──────────────│    accounts     │            │
      │              │     账本表      │            │
      │              └────────┬────────┘            │
      │                       │ 1:N                │
      │                       │                     │
      │              �──────────┴──────────┐          │
      │              │                     │          │
      │       ┌─────┴─────┐       ┌────┴────┐    │
      │       │  records  │       │ budgets │    │
      │       │   账单表   │       │  预算表  │    │
      │       └───────────┘       └─────────┘    │
      │              │                                  │
      │              │ N:1                            │
      │              ▼                                │
      │       ┌────────────┐                        │
      │       │ categories│                        │
      │       │  分类表   │◄─────────────────┘
      │       └───────────┘
      │              ▲
      │              │
      │              │ N:1 (system categories)
      └──────────────┘
              │
              │ 1:N
      ┌────────┴────────┐
      │ login_logs     │ verification_codes
      │ 登录日志表     │ 验证码表
      └────────────────┘
```

---

## 3. 表结构说明

### 3.1 users（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 用户ID，自增主键 |
| username | VARCHAR(20) | 用户名/昵称，4-20位 |
| phone | VARCHAR(11) | 手机号，唯一登录标识 |
| password_hash | VARCHAR(255) | bcrypt加密后的密码 |
| avatar_url | VARCHAR(512) | 头像URL |
| status | TINYINT | 账号状态：1正常，0禁用 |
| lock_until | DATETIME | 锁定截止时间，连续失败5次后锁定10分钟 |
| login_fail_count | TINYINT | 连续登录失败次数 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| last_login_at | DATETIME | 最后登录时间 |

**业务规则：**
- 登录失败连续5次后，锁定账号10分钟
- 密码使用bcrypt加密存储

### 3.2 auth_tokens（认证Token表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | Token记录ID |
| user_id | BIGINT | 关联用户ID |
| token | VARCHAR(255) | Token值（记住登录时生成） |
| device_info | VARCHAR(255) | 设备信息 |
| ip_address | VARCHAR(45) | IP地址 |
| expires_at | DATETIME | 过期时间（默认30天） |
| created_at | DATETIME | 创建时间 |

**业务规则：**
- 记住登录状态时生成Token，有效期30天

### 3.3 login_logs（登录日志表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 日志ID |
| user_id | BIGINT | 关联用户ID |
| phone | VARCHAR(11) | 登录时输入的手机号 |
| status | TINYINT | 登录结果：1成功，0失败 |
| fail_reason | VARCHAR(100) | 失败原因 |
| ip_address | VARCHAR(45) | IP地址 |
| device_info | VARCHAR(255) | 设备信息 |
| created_at | DATETIME | 登录时间 |

### 3.4 verification_codes（验证码表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 验证码ID |
| phone | VARCHAR(11) | 手机号 |
| type | VARCHAR(20) | 验证码类型 |
| code | VARCHAR(10) | 验证码 |
| used | TINYINT | 是否已使用：0未使用，1已使用 |
| expires_at | DATETIME | 过期时间（10分钟） |
| created_at | DATETIME | 创建时间 |

**业务规则：**
- 验证码有效期10分钟
- 验证码类型：`password_reset`（找回密码）

### 3.5 accounts（账本表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 账本ID |
| user_id | BIGINT | 所属用户ID |
| name | VARCHAR(50) | 账本名称 |
| currency | VARCHAR(10) | 货币代码，默认CNY |
| icon | VARCHAR(50) | 账本图标 |
| balance | DECIMAL(15,2) | 当前余额 |
| is_default | TINYINT | 是否默认账本：1是，0否 |
| status | TINYINT | 状态：1正常，0删除 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| deleted_at | DATETIME | 软删除时间 |

**业务规则：**
- 支持多账本（如日常账本、旅行账本）
- 余额由触发器自动计算维护

### 3.6 categories（分类表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 分类ID |
| user_id | BIGINT | 所属用户ID，NULL表示系统预设 |
| name | VARCHAR(30) | 分类名称 |
| icon | VARCHAR(50) | 分类图标名称 |
| type | TINYINT | 类型：1支出，2收入 |
| sort_order | INT | 排序顺序 |
| is_system | TINYINT | 是否系统预设：1系统，0自定义 |
| status | TINYINT | 状态：1正常，0删除 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| deleted_at | DATETIME | 软删除时间 |

**业务规则：**
- `user_id`为NULL表示系统预设分类，所有用户可用
- 自定义分类属于特定用户，删除时检查关联账单

### 3.7 records（账单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 账单ID |
| user_id | BIGINT | 所属用户ID |
| account_id | BIGINT | 所属账本ID |
| category_id | BIGINT | 所属分类ID |
| type | TINYINT | 账单类型：1支出，2收入 |
| amount | DECIMAL(15,2) | 金额，保留两位小数 |
| note | VARCHAR(100) | 备注，最多100字 |
| record_date | DATE | 账单日期 |
| record_time | TIME | 账单时间 |
| status | TINYINT | 状态：1正常，0删除 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| deleted_at | DATETIME | 软删除时间 |

**索引优化：**
- `(user_id, record_date)` 组合索引支持按用户按月查询账单
- `(user_id, type, record_date)` 组合索引支持按类型统计分析

### 3.8 budgets（预算表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 预算ID |
| user_id | BIGINT | 所属用户ID |
| account_id | BIGINT | 所属账本ID，NULL表示跨账本 |
| category_id | BIGINT | 所属分类ID，NULL表示总预算 |
| month | VARCHAR(7) | 预算月份，格式YYYY-MM |
| amount | DECIMAL(15,2) | 预算金额 |
| warn_percent | TINYINT | 预警百分比，默认80% |
| status | TINYINT | 状态：1正常，0删除 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| deleted_at | DATETIME | 软删除时间 |

**业务规则：**
- `category_id`为NULL表示总预算，否则为分类预算
- `account_id`为NULL表示跨账本预算

### 3.9 backups（数据备份记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 备份记录ID |
| user_id | BIGINT | 所属用户ID |
| type | VARCHAR(20) | 备份类型：full/partial |
| file_url | VARCHAR(512) | 备份文件URL或路径 |
| file_size | BIGINT | 文件大小（字节） |
| record_count | INT | 备份包含的账单数量 |
| status | TINYINT | 状态：1成功，0失败 |
| created_at | DATETIME | 备份时间 |

---

## 4. 预设数据

### 4.1 系统预设支出分类（13个）

| 名称 | 图标 | 排序 |
|------|------|------|
| 餐饮 | restaurant | 1 |
| 交通 | directions_bus | 2 |
| 购物 | shopping_bag | 3 |
| 居住 | home | 4 |
| 娱乐 | movie | 5 |
| 医疗 | health_and_safety | 6 |
| 教育 | school | 7 |
| 人情 | favorite | 8 |
| 宠物 | pets | 9 |
| 旅行 | flight | 10 |
| 运动 | fitness_center | 11 |
| 订阅 | subscriptions | 12 |
| 其他支出 | more_horiz | 99 |

### 4.2 系统预设收入分类（6个）

| 名称 | 图标 | 排序 |
|------|------|------|
| 工资 | payments | 1 |
| 奖金 | redeem | 2 |
| 兼职 | account_balance_wallet | 3 |
| 投资收益 | trending_up | 4 |
| 红包 | card_giftcard | 5 |
| 其他收入 | more_horiz | 99 |

---

## 5. 视图定义

### 5.1 v_monthly_summary（月度账单汇总视图）

按用户和月份汇总账单数据，用于统计报表。

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | BIGINT | 用户ID |
| month | VARCHAR(7) | 月份YYYY-MM |
| type | TINYINT | 账单类型 |
| total_amount | DECIMAL | 当月该类型总金额 |
| record_count | INT | 当月该类型账单数量 |

### 5.2 v_budget_progress（预算执行进度视图）

实时计算各预算的执行情况，用于预算页面展示。

| 字段 | 类型 | 说明 |
|------|------|------|
| budget_id | BIGINT | 预算ID |
| user_id | BIGINT | 用户ID |
| month | VARCHAR(7) | 预算月份 |
| budget_amount | DECIMAL | 预算金额 |
| spent_amount | DECIMAL | 已使用金额 |
| used_percent | DECIMAL | 使用百分比 |
| status | VARCHAR(20) | 状态：normal/warning/exceeded |

---

## 6. 触发器说明

### 6.1 trg_records_after_insert

**作用：** 账单新增时自动更新账本余额

```sql
IF NEW.type = 1 THEN
    -- 支出，减少余额
    UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
ELSE
    -- 收入，增加余额
    UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
END IF;
```

### 6.2 trg_records_after_delete

**作用：** 账单删除时回滚账本余额

```sql
IF OLD.type = 1 THEN
    -- 支出，恢复余额
    UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
ELSE
    -- 收入，减少余额
    UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
END IF;
```

---

## 7. 存储过程

### 7.1 cleanup_expired_tokens

清理过期的登录Token，建议定时任务执行。

```sql
CALL cleanup_expired_tokens();
```

### 7.2 cleanup_expired_codes

清理过期或已使用的验证码，建议定时任务执行。

```sql
CALL cleanup_expired_codes();
```

---

## 8. 索引建议

以下索引可根据实际查询分析添加：

```sql
-- 按用户、类型、分类统计
CREATE INDEX idx_records_user_type_category ON records(user_id, type, category_id);

-- 按用户和月份查询预算
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);
```

---

## 9. 迁移注意事项

### 9.1 首次部署

执行 `schema.sql` 中的所有建表语句，初始化数据会自动插入系统预设分类。

### 9.2 数据备份

建议使用 `backups` 表记录备份历史，支持全量备份和增量备份。

### 9.3 触发器依赖

启用触发器前，确保 `records` 表的 `account_id` 外键约束正确，以避免孤立记录。

---

*文档结束 · Database Design V1.0.3*
