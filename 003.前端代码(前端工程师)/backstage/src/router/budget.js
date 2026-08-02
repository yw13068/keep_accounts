/**
 * 预算路由
 */
const Router = require('koa-router');
const budgetController = require('../controller/budgetController');
const { authenticate } = require('../middleware/auth');

const router = new Router({ prefix: '/api/budgets' });

// 所有预算接口都需要登录

// GET /api/budgets/month - 获取指定月份的预算数据（含分类进度）
router.get('/month', authenticate, budgetController.getMonthBudget);

// POST /api/budgets - 创建或更新预算
router.post('/', authenticate, budgetController.upsertBudget);

module.exports = router;
