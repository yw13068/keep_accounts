/**
 * 预算 Service
 */
const db = require('../utils/db');

/**
 * 获取指定月份的预算数据（含各分类实际支出）
 * @param {Object} params
 */
async function getMonthBudget({ userId, month }) {
  if (!month) {
    month = new Date().toISOString().slice(0, 7);
  }

  // 1. 获取该月所有分类的实际支出
  const actualSql = `
    SELECT
      r.category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      c.type AS category_type,
      COALESCE(SUM(r.amount), 0) AS spent
    FROM records r
    JOIN categories c ON r.category_id = c.id
    WHERE r.user_id = ?
      AND r.status = 1
      AND r.type = 1
      AND DATE_FORMAT(r.record_date, '%Y-%m') = ?
    GROUP BY r.category_id, c.name, c.icon, c.type
  `;
  const actualRows = await db.query(actualSql, [userId, month]);

  // 2. 获取该月所有分类的预算
  const budgetSql = `
    SELECT category_id, amount
    FROM budgets
    WHERE user_id = ?
      AND month = ?
      AND status = 1
      AND category_id IS NOT NULL
  `;
  const budgetRows = await db.query(budgetSql, [userId, month]);
  const budgetMap = {};
  budgetRows.forEach(row => {
    budgetMap[row.category_id] = parseFloat(row.amount);
  });

  // 3. 获取该月总预算（仅作备用，不再用于概览展示）
  const totalBudgetSql = `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM budgets
    WHERE user_id = ?
      AND month = ?
      AND status = 1
      AND category_id IS NULL
  `;
  await db.query(totalBudgetSql, [userId, month]);

  // 4. 合并数据：支出分类 + 收入分类（收入不需要预算）
  const categorySql = `
    SELECT id, name, icon, type
    FROM categories
    WHERE status = 1
    ORDER BY type, sort_order
  `;
  const categoryRows = await db.query(categorySql, []);

  // 组合分类数据
  const categories = categoryRows
    .filter(cat => cat.type === 1) // 只返回支出分类
    .map(cat => {
      const spent = parseFloat(
        actualRows.find(r => r.category_id === cat.id)?.spent || 0
      );
      const budget = budgetMap[cat.id] || 0;
      const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        spent,
        budget,
        percent: Math.min(percent, 100)
      };
    });

  // 仅统计已配置预算的分类
  const configuredCategories = categories.filter(cat => cat.budget > 0);
  const configuredTotalBudget = configuredCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const configuredTotalSpent = configuredCategories.reduce((sum, cat) => sum + cat.spent, 0);

  return {
    month,
    totalBudget: configuredTotalBudget,
    totalSpent: configuredTotalSpent,
    percent: configuredTotalBudget > 0 ? Math.round((configuredTotalSpent / configuredTotalBudget) * 100) : 0,
    categories
  };
}

/**
 * 创建或更新预算（按分类）
 * @param {Object} data
 */
async function upsertBudget({ userId, month, categoryId, amount, warnPercent = 80 }) {
  const sql = `
    INSERT INTO budgets (user_id, category_id, month, amount, warn_percent)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE amount = VALUES(amount), warn_percent = VALUES(warn_percent)
  `;
  await db.query(sql, [userId, categoryId, month, amount, warnPercent]);
}

/**
 * 创建或更新总预算
 * @param {Object} data
 */
async function upsertTotalBudget({ userId, month, amount, warnPercent = 80 }) {
  const sql = `
    INSERT INTO budgets (user_id, category_id, month, amount, warn_percent)
    VALUES (?, NULL, ?, ?, ?)
    ON DUPLICATE KEY UPDATE amount = VALUES(amount), warn_percent = VALUES(warn_percent)
  `;
  await db.query(sql, [userId, month, amount, warnPercent]);
}

module.exports = {
  getMonthBudget,
  upsertBudget,
  upsertTotalBudget
};
