/**
 * 认证中间件
 */
const jwt = require('../utils/jwt');
const userService = require('../service/userService');
const resp = require('../utils/response');

/**
 * 验证用户是否已登录
 * 将用户信息挂载到 ctx.state.user
 */
async function authenticate(ctx, next) {
  // 从 Header 提取 Token
  const authHeader = ctx.get('Authorization');
  const token = jwt.extractToken(authHeader);

  if (!token) {
    return resp.errors.unauthorized(ctx, '请先登录');
  }

  // 验证 Token
  const payload = jwt.verifyToken(token);
  if (!payload) {
    return resp.errors.unauthorized(ctx, '登录已过期，请重新登录');
  }

  // 查找用户
  const user = await userService.findById(payload.userId);
  if (!user) {
    return resp.errors.unauthorized(ctx, '用户不存在');
  }

  if (user.status === 0) {
    return resp.errors.forbidden(ctx, '账号已被禁用');
  }

  // 挂载用户信息到 ctx.state
  ctx.state.user = {
    id: user.id,
    username: user.username,
    phone: user.phone
  };

  await next();
}

module.exports = {
  authenticate
};
