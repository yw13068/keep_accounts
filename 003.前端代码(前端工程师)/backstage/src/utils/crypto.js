/**
 * 密码加密工具
 */
const bcrypt = require('bcrypt');
const config = require('../config');

/**
 * 加密密码
 * @param {string} plainPassword 明文密码
 * @returns {Promise<string>} 加密后密码
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, config.password.saltRounds);
}

/**
 * 验证密码
 * @param {string} plainPassword 明文密码
 * @param {string} hashedPassword 加密密码
 * @returns {Promise<boolean>} 是否匹配
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * 生成随机整数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 随机数
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成验证码
 * @param {number} length 验证码长度，默认6位
 * @returns {string} 验证码
 */
function generateVerifyCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += randomInt(0, 9).toString();
  }
  return code;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateVerifyCode,
  randomInt
};
