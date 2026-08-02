/**
 * 账单 Service
 */
const db = require('../utils/db');

/**
 * 获取账单列表
 * @param {Object} params 查询参数
 */
async function getRecords({ userId, type, month, page, pageSize }) {
  let sql = `
    SELECT r.id, r.type, r.amount, r.note, r.record_date, r.record_time,
           c.id as category_id, c.name as category_name, c.icon as category_icon,
           a.id as account_id, a.name as account_name
    FROM records r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN accounts a ON r.account_id = a.id
    WHERE r.user_id = ? AND r.status = 1
  `;
  const params = [userId];

  if (type !== null) {
    sql += ' AND r.type = ?';
    params.push(type);
  }

  if (month) {
    sql += ' AND DATE_FORMAT(r.record_date, "%Y-%m") = ?';
    params.push(month);
  }

  sql += ' ORDER BY r.record_date DESC, r.record_time DESC';
  sql += ` LIMIT ${parseInt(pageSize)} OFFSET ${parseInt((page - 1) * pageSize)}`;

  const rows = await db.query(sql, params);

  // 格式化数据
  return rows.map(row => ({
    id: row.id,
    type: row.type,
    amount: parseFloat(row.amount),
    note: row.note,
    recordDate: row.record_date,
    recordTime: row.record_time,
    category: {
      id: row.category_id,
      name: row.category_name,
      icon: row.category_icon
    },
    account: {
      id: row.account_id,
      name: row.account_name
    }
  }));
}

/**
 * 获取今日账单
 * @param {Object} params 查询参数
 */
async function getTodayRecords({ userId, type }) {
  const today = new Date().toISOString().split('T')[0];

  let sql = `
    SELECT r.id, r.type, r.amount, r.note, r.record_date, r.record_time,
           c.id as category_id, c.name as category_name, c.icon as category_icon,
           a.id as account_id, a.name as account_name
    FROM records r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN accounts a ON r.account_id = a.id
    WHERE r.user_id = ? AND r.status = 1 AND r.record_date = ?
  `;
  const params = [userId, today];

  if (type !== null) {
    sql += ' AND r.type = ?';
    params.push(type);
  }

  sql += ' ORDER BY r.record_time DESC';

  const rows = await db.query(sql, params);

  // 计算今日总计
  let total = 0;
  rows.forEach(row => {
    if (type !== null && row.type === type) {
      total += parseFloat(row.amount);
    } else if (type === null) {
      total += parseFloat(row.amount);
    }
  });

  return {
    records: rows.map(row => ({
      id: row.id,
      type: row.type,
      amount: parseFloat(row.amount),
      note: row.note,
      recordDate: row.record_date,
      recordTime: row.record_time,
      category: {
        id: row.category_id,
        name: row.category_name,
        icon: row.category_icon
      },
      account: {
        id: row.account_id,
        name: row.account_name
      }
    })),
    total: type === 1 ? -total : total, // 支出为负，收入为正
    date: today
  };
}

/**
 * 获取本月统计
 * @param {Object} params 查询参数
 */
async function getMonthSummary({ userId, month }) {
  // 如果没有指定月份，使用当前月份
  if (!month) {
    month = new Date().toISOString().slice(0, 7);
  }

  // 获取支出统计
  const expenseSql = `
    SELECT COALESCE(SUM(amount), 0) as total
    FROM records
    WHERE user_id = ? AND type = 1 AND status = 1
    AND DATE_FORMAT(record_date, "%Y-%m") = ?
  `;
  const expenseRows = await db.query(expenseSql, [userId, month]);
  const expenseTotal = parseFloat(expenseRows[0]?.total || 0);

  // 获取收入统计
  const incomeSql = `
    SELECT COALESCE(SUM(amount), 0) as total
    FROM records
    WHERE user_id = ? AND type = 2 AND status = 1
    AND DATE_FORMAT(record_date, "%Y-%m") = ?
  `;
  const incomeRows = await db.query(incomeSql, [userId, month]);
  const incomeTotal = parseFloat(incomeRows[0]?.total || 0);

  return {
    month,
    income: incomeTotal,
    expense: expenseTotal,
    balance: incomeTotal - expenseTotal
  };
}

/**
 * 获取分类统计（用于饼图）
 * @param {Object} params 查询参数
 */
async function getCategoryStats({ userId, type, month }) {
  if (!month) {
    month = new Date().toISOString().slice(0, 7);
  }

  const sql = `
    SELECT c.id, c.name, c.icon, c.type,
           COALESCE(SUM(r.amount), 0) as total
    FROM categories c
    LEFT JOIN records r ON c.id = r.category_id
      AND r.user_id = ?
      AND r.status = 1
      AND DATE_FORMAT(r.record_date, "%Y-%m") = ?
      AND r.type = ?
    WHERE c.type = ?
    GROUP BY c.id, c.name, c.icon, c.type
    HAVING total > 0
    ORDER BY total DESC
  `;

  const rows = await db.query(sql, [userId, month, type, type]);

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    type: row.type,
    total: parseFloat(row.total)
  }));
}

/**
 * 获取月度每日统计（用于折线图）
 * @param {Object} params 查询参数
 */
async function getDailyStats({ userId, month }) {
  if (!month) {
    month = new Date().toISOString().slice(0, 7);
  }

  const sql = `
    SELECT
      DAY(record_date) as day,
      type,
      COALESCE(SUM(amount), 0) as total
    FROM records
    WHERE user_id = ?
      AND status = 1
      AND DATE_FORMAT(record_date, "%Y-%m") = ?
    GROUP BY DAY(record_date), type
    ORDER BY day ASC
  `;

  const rows = await db.query(sql, [userId, month]);

  // 计算该月的天数
  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  // 初始化每日数据
  const dailyData = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dailyData.push({ day: d, expense: 0, income: 0 });
  }

  // 填充数据
  rows.forEach(row => {
    const idx = dailyData.findIndex(d => d.day === row.day);
    if (idx !== -1) {
      if (row.type === 1) {
        dailyData[idx].expense = parseFloat(row.total);
      } else if (row.type === 2) {
        dailyData[idx].income = parseFloat(row.total);
      }
    }
  });

  return dailyData;
}

/**
 * 创建账单
 * @param {Object} data 账单数据
 * @returns {Promise<number>} 新账单 ID
 */
async function createRecord({ userId, accountId, categoryId, type, amount, note, recordDate, recordTime }) {
  return db.insertAndGetId(
    'INSERT INTO records (user_id, account_id, category_id, type, amount, note, record_date, record_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, accountId, categoryId, type, amount, note, recordDate, recordTime]
  );
}

/**
 * 获取用户的默认账本
 * @param {number} userId 用户ID
 * @returns {Promise<Object|null>} 账本
 */
async function getDefaultAccount(userId) {
  const rows = await db.query(
    'SELECT id FROM accounts WHERE user_id = ? AND is_default = 1 AND status = 1 LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

module.exports = {
  getRecords,
  getTodayRecords,
  getMonthSummary,
  getCategoryStats,
  getDailyStats,
  createRecord,
  getDefaultAccount
};
