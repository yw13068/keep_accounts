/**
 * 认证 Controller
 */
const userService = require('../service/userService');
const verifyCodeService = require('../service/verifyCodeService');
const crypto = require('../utils/crypto');
const resp = require('../utils/response');
const config = require('../config');

/**
 * POST /api/auth/register
 * 用户注册
 */
async function register(ctx) {
  const { phone, username, password } = ctx.request.body;

  // 1. 参数校验
  if (!phone || !username || !password) {
    return resp.errors.badRequest(ctx, '手机号、用户名、密码不能为空');
  }
  if (!/^1\d{10}$/.test(phone)) {
    return resp.errors.validationError(ctx, '手机号格式不正确');
  }
  if (username.length < 4 || username.length > 20) {
    return resp.errors.validationError(ctx, '用户名长度4-20位');
  }
  if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(password)) {
    return resp.errors.validationError(ctx, '密码须8-20位且包含字母和数字');
  }

  // 2. 检查手机号是否已注册
  if (await userService.isPhoneExists(phone)) {
    return resp.errors.conflict(ctx, '该手机号已注册');
  }

  // 3. 检查用户名是否已被占用
  if (await userService.isUsernameExists(username)) {
    return resp.errors.conflict(ctx, '用户名已被占用');
  }

  // 4. 加密密码并创建用户
  const passwordHash = await crypto.hashPassword(password);
  const userId = await userService.createUser({ phone, username, passwordHash });

  // 5. 创建 Token
  const { token, expiresAt } = await userService.createAuthToken({
    userId,
    deviceInfo: ctx.get('user-agent'),
    ipAddress: ctx.ip
  });

  // 6. 记录登录日志
  await userService.createLoginLog({
    userId, phone, status: 1, failReason: null,
    ipAddress: ctx.ip, deviceInfo: ctx.get('user-agent')
  });

  // 7. 返回
  resp.success(ctx, {
    token,
    expiresAt: expiresAt.toISOString(),
    user: { id: userId, username, phone }
  }, '注册成功');
}

/**
 * POST /api/auth/login
 * 用户登录
 */
async function login(ctx) {
  const { phone, password } = ctx.request.body;

  // 1. 参数校验
  if (!phone || !password) {
    return resp.errors.badRequest(ctx, '手机号和密码不能为空');
  }

  // 2. 查找用户
  const user = await userService.findByPhone(phone);
  if (!user) {
    await userService.createLoginLog({ userId: null, phone, status: 0, failReason: '用户不存在', ipAddress: ctx.ip, deviceInfo: ctx.get('user-agent') });
    return resp.errors.unauthorized(ctx, '用户名或密码错误');
  }

  // 3. 检查账号状态
  if (user.status === 0) {
    return resp.errors.forbidden(ctx, '账号已被禁用');
  }
  if (userService.isAccountLocked(user)) {
    return resp.errors.forbidden(ctx, `账号已锁定，请${config.login.lockMinutes}分钟后再试`);
  }

  // 4. 验证密码
  const passwordMatch = await crypto.comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    // 记录失败
    await userService.incrementLoginFail(phone);
    await userService.createLoginLog({ userId: user.id, phone, status: 0, failReason: '密码错误', ipAddress: ctx.ip, deviceInfo: ctx.get('user-agent') });

    // 检查失败次数
    const updated = await userService.findByPhone(phone);
    if (updated.login_fail_count >= config.login.maxFailAttempts) {
      await userService.lockAccount(phone);
      return resp.errors.forbidden(ctx, `连续${config.login.maxFailAttempts}次登录失败，账号已锁定${config.login.lockMinutes}分钟`);
    }
    return resp.errors.unauthorized(ctx, '用户名或密码错误');
  }

  // 5. 登录成功
  await userService.resetLoginFail(phone);
  await userService.updateLastLogin(user.id);
  const { token, expiresAt } = await userService.createAuthToken({
    userId: user.id,
    deviceInfo: ctx.get('user-agent'),
    ipAddress: ctx.ip
  });
  await userService.createLoginLog({ userId: user.id, phone, status: 1, failReason: null, ipAddress: ctx.ip, deviceInfo: ctx.get('user-agent') });

  resp.success(ctx, {
    token,
    expiresAt: expiresAt.toISOString(),
    user: { id: user.id, username: user.username, phone: user.phone }
  }, '登录成功');
}

/**
 * POST /api/auth/send-code
 * 发送验证码（找回密码）
 */
async function sendCode(ctx) {
  const { phone } = ctx.request.body;

  if (!phone || !/^1\d{10}$/.test(phone)) {
    return resp.errors.validationError(ctx, '请输入正确的手机号');
  }

  // 检查用户是否存在
  const user = await userService.findByPhone(phone);
  if (!user) {
    return resp.errors.notFound(ctx, '该手机号未注册');
  }

  // 生成验证码（实际生产应发短信，此处模拟）
  const code = await verifyCodeService.createCode(phone, 'password_reset');

  // 模拟发送成功（实际发短信）
  console.log(`[模拟短信] 向 ${phone} 发送验证码：${code}`);

  resp.success(ctx, { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }, '验证码已发送');
}

/**
 * POST /api/auth/reset-password
 * 重置密码
 */
async function resetPassword(ctx) {
  const { phone, code, newPassword } = ctx.request.body;

  // 1. 参数校验
  if (!phone || !code || !newPassword) {
    return resp.errors.badRequest(ctx, '手机号、验证码、新密码不能为空');
  }
  if (!/^1\d{10}$/.test(phone)) {
    return resp.errors.validationError(ctx, '手机号格式不正确');
  }
  if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(newPassword)) {
    return resp.errors.validationError(ctx, '密码须8-20位且包含字母和数字');
  }

  // 2. 验证验证码
  const valid = await verifyCodeService.verifyCode(phone, code, 'password_reset');
  if (!valid) {
    return resp.errors.badRequest(ctx, '验证码错误或已过期');
  }

  // 3. 查找用户
  const user = await userService.findByPhone(phone);
  if (!user) {
    return resp.errors.notFound(ctx, '用户不存在');
  }

  // 4. 更新密码
  const passwordHash = await crypto.hashPassword(newPassword);
  await ctx.state.db.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, user.id]
  );

  // 5. 标记验证码已使用
  await verifyCodeService.markCodeUsed(phone, 'password_reset');

  resp.success(ctx, null, '密码重置成功');
}

module.exports = {
  register,
  login,
  sendCode,
  resetPassword
};
