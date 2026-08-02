/**
 * 认证路由
 */
const Router = require('koa-router');
const authController = require('../controller/authController');
const { authenticate } = require('../middleware/auth');

const router = new Router({ prefix: '/api/auth' });

// POST /api/auth/register - 用户注册
router.post('/register', authController.register);

// POST /api/auth/login - 用户登录
router.post('/login', authController.login);

// POST /api/auth/send-code - 发送验证码
router.post('/send-code', authController.sendCode);

// POST /api/auth/reset-password - 重置密码（需先验证手机号）
router.post('/reset-password', authController.resetPassword);

module.exports = router;
