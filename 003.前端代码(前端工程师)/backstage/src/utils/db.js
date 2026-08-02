/**
 * MySQL 连接池工具
 */
const mysql = require('mysql2/promise');
const config = require('../config');

let pool = null;

/**
 * 获取连接池单例
 * @returns {mysql.Pool} MySQL 连接池
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port || 3306,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      charset: config.database.charset,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

/**
 * 执行查询
 * @param {string} sql SQL 语句
 * @param {Array} params 参数数组
 * @returns {Promise<Array>} 查询结果
 */
async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * 执行单条插入并返回自增 ID
 * @param {string} sql SQL 语句
 * @param {Array} params 参数数组
 * @returns {Promise<number>} 自增 ID
 */
async function insertAndGetId(sql, params = []) {
  const pool = getPool();
  const [result] = await pool.execute(sql, params);
  return result.insertId;
}

/**
 * 关闭连接池
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  query,
  insertAndGetId,
  closePool
};
