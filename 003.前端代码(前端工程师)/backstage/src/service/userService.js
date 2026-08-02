/**
 * 用户 Service
 */
const db = require('../utils/db');
const crypto = require('../utils/crypto');
const jwt = require('../utils/jwt');
const config = require('../config');

/**
 * 根据 ID 查找用户
 * @param {number} id 用户 ID
 * @returns {Promise<Object|null} 用户对象或 null
 */
async function findById(id) {
  const rows = await db.query(
    'SELECT id, username, phone, password_hash, status, lock_until, login_fail_count FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/**
 * 根据手机号查找用户
 * @param {string} phone 手机号
 * @returns {Promise<Object|null} 用户对象或 null
 */
async function findByPhone(phone) {
  const rows = await db.query(
    'SELECT id, username, phone, password_hash, status, lock_until, login_fail_count FROM users WHERE phone = ?',
    [phone]
  );
  return rows[0] || null;
}

/**
 * 根据用户名查找用户
 * @param {string} username 用户名
 * @returns {Promise<Object|null} 用户对象或 null
 */
async function findByUsername(username) {
  const rows = await db.query(
    'SELECT id, username, phone, password_hash, status, lock_until, login_fail_count FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
}

/**
 * 创建用户
 * @param {Object} userData 用户数据
 * @returns {Promise<number} 新用户 ID
 */
async function createUser({ username, phone, passwordHash }) {
  const userId = await db.insertAndGetId(
    'INSERT INTO users (username, phone, password_hash) VALUES (?, ?, ?)',
    [username, phone, passwordHash]
  );

  // 自动创建默认账本
  await db.query(
    'INSERT INTO accounts (user_id, name, is_default) VALUES (?, ?, 1)',
    [userId, '日常账本']
  );

  return userId;
}

/**
 * 检查用户名是否存在
 * @param {string} username 用户名
 * @returns {Promise<boolean} 是否存在
 */
async function isUsernameExists(username) {
  const rows = await db.query(
    'SELECT 1 FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows.length > 0;
}

/**
 * 检查手机号是否存在
 * @param {string} phone 手机号
 * @returns {Promise<boolean} 是否存在
 */
async function isPhoneExists(phone) {
  const rows = await db.query(
    'SELECT 1 FROM users WHERE phone = ? LIMIT 1',
    [phone]
  );
  return rows.length > 0;
}

/**
 * 增加登录失败次数
 * @param {string} phone 手机号
 */
async function incrementLoginFail(phone) {
  await db.query(
    'UPDATE users SET login_fail_count = login_fail_count + 1 WHERE phone = ?',
    [phone]
  );
}

/**
 * 重置登录失败次数
 * @param {string} phone 手机号
 */
async function resetLoginFail(phone) {
  await db.query(
    'UPDATE users SET login_fail_count = 0, lock_until = NULL WHERE phone = ?',
    [phone]
  );
}

/**
 * 锁定账号
 * @param {string} phone 手机号
 */
async function lockAccount(phone) {
  const lockUntil = new Date(Date.now() + config.login.lockMinutes * 60 * 1000);
  await db.query(
    'UPDATE users SET lock_until = ? WHERE phone = ?',
    [lockUntil, phone]
  );
}

/**
 * 更新最后登录时间
 * @param {number} userId 用户 ID
 */
async function updateLastLogin(userId) {
  await db.query(
    'UPDATE users SET last_login_at = NOW(), login_fail_count = 0, lock_until = NULL WHERE id = ?',
    [userId]
  );
}

/**
 * 创建认证 Token
 * @param {Object} tokenData Token 数据
 * @returns {Promise<Object>} { token, expiresAt }
 */
async function createAuthToken({ userId, deviceInfo, ipAddress }) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天后

  // 最多重试3次生成唯一token
  let token;
  for (let i = 0; i < 3; i++) {
    token = jwt.generateToken({ userId, random: Math.random().toString(36).slice(2) });
    try {
      await db.query(
        'INSERT INTO auth_tokens (user_id, token, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)',
        [userId, token, deviceInfo, ipAddress, expiresAt]
      );
      return { token, expiresAt };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' && i < 2) {
        continue; // 重试
      }
      throw err;
    }
  }
  return { token, expiresAt };
}

/**
 * 记录登录日志
 * @param {Object} logData 日志数据
 */
async function createLoginLog({ userId, phone, status, failReason, ipAddress, deviceInfo }) {
  await db.query(
    'INSERT INTO login_logs (user_id, phone, status, fail_reason, ip_address, device_info) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, phone, status, failReason, ipAddress, deviceInfo]
  );
}

/**
 * 检查账号是否被锁定
 * @param {Object} user 用户对象
 * @returns {boolean} 是否锁定
 */
function isAccountLocked(user) {
  if (!user.lock_until) return false;
  return new Date(user.lock_until) > new Date();
}

/**
 * 更新用户头像
 * @param {number} userId 用户ID
 * @param {string} avatarUrl 头像URL
 */
async function updateAvatar(userId, avatarUrl) {
  await db.query(
    'UPDATE users SET avatar_url = ? WHERE id = ?',
    [avatarUrl, userId]
  );
}

module.exports = {
  findById,
  findByPhone,
  findByUsername,
  createUser,
  isUsernameExists,
  isPhoneExists,
  incrementLoginFail,
  resetLoginFail,
  lockAccount,
  updateLastLogin,
  createAuthToken,
  createLoginLog,
  isAccountLocked,
  updateAvatar
};
