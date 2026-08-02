/**
 * 账单路由
 */
const Router = require('koa-router');
const recordController = require('../controller/recordController');
const { authenticate } = require('../middleware/auth');

const router = new Router({ prefix: '/api/records' });

// 所有账单接口都需要登录

// GET /api/records - 获取账单列表
router.get('/', authenticate, recordController.getRecords);

// GET /api/records/today - 获取今日账单
router.get('/today', authenticate, recordController.getTodayRecords);

// GET /api/records/month - 获取本月统计
router.get('/month', authenticate, recordController.getMonthSummary);

// GET /api/records/category-stats - 获取分类统计（用于饼图）
router.get('/category-stats', authenticate, recordController.getCategoryStats);

// GET /api/records/daily-stats - 获取月度每日统计（用于折线图）
router.get('/daily-stats', authenticate, recordController.getDailyStats);

// POST /api/records - 创建账单
router.post('/', authenticate, recordController.createRecord);

module.exports = router;
