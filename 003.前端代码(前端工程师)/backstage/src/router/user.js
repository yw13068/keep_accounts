/**
 * 用户路由
 */
const Router = require('koa-router');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const userService = require('../service/userService');
const resp = require('../utils/response');

const router = new Router({ prefix: '/api/user' });

// GET /api/user/profile - 获取当前用户信息
router.get('/profile', authenticate, async (ctx) => {
  const userId = ctx.state.user.id;
  const users = await userService.findById(userId);
  const user = Array.isArray(users) ? users[0] : users;
  if (!user) {
    return resp.errors.notFound(ctx, '用户不存在');
  }
  ctx.body = {
    code: 0,
    message: 'success',
    data: {
      id: user.id,
      username: user.username,
      phone: user.phone,
      avatarUrl: user.avatar_url || null
    }
  };
});

// POST /api/user/avatar - 上传头像
router.post('/avatar', authenticate, async (ctx) => {
  const { avatar } = ctx.request.body;
  const userId = ctx.state.user.id;

  if (!avatar || typeof avatar !== 'string') {
    return resp.errors.badRequest(ctx, '请提供头像数据');
  }

  // 生成文件路径: uploads/avatars/{userId}_{timestamp}.png
  const timestamp = Date.now();
  const filename = `${userId}_${timestamp}.png`;
  const uploadDir = path.join(__dirname, '../../uploads/avatars');

  // 确保目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);

  // 去除 base64 前缀，转为 Buffer 写入文件
  const base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filepath, buffer);

  // 生成访问 URL
  const avatarUrl = `/uploads/avatars/${filename}`;

  // 更新数据库
  await userService.updateAvatar(userId, avatarUrl);

  resp.success(ctx, { avatarUrl }, '头像上传成功');
});

module.exports = router;
