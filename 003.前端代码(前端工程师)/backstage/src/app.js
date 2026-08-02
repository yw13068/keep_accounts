/**
 * Koa 应用入口
 */
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const router = require('koa-router')();
const path = require('path');
const fs = require('fs');
const config = require('./config');
const response = require('./utils/response');

// 路由
const authRouter = require('./router/auth');
const userRouter = require('./router/user');
const recordRouter = require('./router/record');
const budgetRouter = require('./router/budget');

// 创建应用
const app = new Koa();

// CORS 跨域支持
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// 全局错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    response.errors.internal(ctx, err.message || '服务器内部错误');
  }
});

// Body 解析（支持大头像 base64）
app.use(bodyParser({ jsonLimit: '10mb' }));

// 挂载 db 到 ctx.state
app.use(async (ctx, next) => {
  ctx.state.db = require('./utils/db');
  await next();
});

// 响应封装
app.use(async (ctx, next) => {
  ctx.success = (data, message) => response.success(ctx, data, message);
  ctx.error = (status, message) => response.errors[status] ? response.errors[status](ctx, message) : response.error(ctx, status, message);
  await next();
});

// 静态文件服务：头像图片
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', ctx.path);
    if (fs.existsSync(filePath)) {
      ctx.type = path.extname(filePath);
      ctx.body = fs.createReadStream(filePath);
      return;
    }
  }
  await next();
});

// 路由
app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(userRouter.routes()).use(userRouter.allowedMethods());
app.use(recordRouter.routes()).use(recordRouter.allowedMethods());
app.use(budgetRouter.routes()).use(budgetRouter.allowedMethods());

// 404
app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = { code: 'NOT_FOUND', message: '接口不存在' };
});

// 启动
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`留白记账 API 服务已启动：http://localhost:${config.port}`);
  });
}

module.exports = app;
