/**
 * JWT Token 工具
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 生成 Token
 * @param {Object} payload - Token 载荷数据
 * @returns {string} JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
}

/**
 * 验证 Token
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的 payload，失败返回 null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (e) {
    return null;
  }
}

/**
 * 从 Authorization Header 提取 Token
 * @param {string} authHeader - Authorization header 值
 * @returns {string|null} Token 或 null
 */
function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken
};
