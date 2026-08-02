/**
 * 验证码 Service
 */
const db = require('../utils/db');
const crypto = require('../utils/crypto');
const config = require('../config');

/**
 * 创建验证码
 * @param {string} phone 手机号
 * @param {string} type 类型：password_reset / bind_phone
 * @returns {Promise<string>} 验证码
 */
async function createCode(phone, type) {
  // 先标记旧验证码为已使用
  await db.query(
    'UPDATE verification_codes SET used = 1 WHERE phone = ? AND type = ? AND used = 0',
    [phone, type]
  );

  const code = crypto.generateVerifyCode(config.verification.codeLength);
  const expiresAt = new Date(Date.now() + config.verification.expiresMinutes * 60 * 1000);

  await db.query(
    'INSERT INTO verification_codes (phone, type, code, expires_at) VALUES (?, ?, ?, ?)',
    [phone, type, code, expiresAt]
  );

  return code;
}

/**
 * 验证验证码
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @param {string} type 类型
 * @returns {Promise<boolean>} 是否有效
 */
async function verifyCode(phone, code, type) {
  const rows = await db.query(
    'SELECT id FROM verification_codes WHERE phone = ? AND code = ? AND type = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
    [phone, code, type]
  );
  return rows.length > 0;
}

/**
 * 标记验证码已使用
 * @param {string} phone 手机号
 * @param {string} type 类型
 */
async function markCodeUsed(phone, type) {
  await db.query(
    'UPDATE verification_codes SET used = 1 WHERE phone = ? AND type = ?',
    [phone, type]
  );
}

module.exports = {
  createCode,
  verifyCode,
  markCodeUsed
};
