/**
 * 账单 Controller
 */
const recordService = require('../service/recordService');
const resp = require('../utils/response');

/**
 * GET /api/records
 * 获取账单列表
 */
async function getRecords(ctx) {
  const { type, month, page = 1, pageSize = 20 } = ctx.query;
  const userId = ctx.state.user.id;

  const result = await recordService.getRecords({
    userId,
    type: type ? parseInt(type) : null,
    month,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });

  resp.success(ctx, result, '获取账单列表成功');
}

/**
 * GET /api/records/today
 * 获取今日账单
 */
async function getTodayRecords(ctx) {
  const { type } = ctx.query;
  const userId = ctx.state.user.id;

  const result = await recordService.getTodayRecords({
    userId,
    type: type ? parseInt(type) : null
  });

  resp.success(ctx, result, '获取今日账单成功');
}

/**
 * GET /api/records/month
 * 获取本月统计
 */
async function getMonthSummary(ctx) {
  const { month } = ctx.query;
  const userId = ctx.state.user.id;

  const result = await recordService.getMonthSummary({
    userId,
    month
  });

  resp.success(ctx, result, '获取本月统计成功');
}

/**
 * GET /api/records/category-stats
 * 获取分类统计（用于饼图）
 */
async function getCategoryStats(ctx) {
  const { type, month } = ctx.query;
  const userId = ctx.state.user.id;

  const result = await recordService.getCategoryStats({
    userId,
    type: type ? parseInt(type) : 1,
    month
  });

  resp.success(ctx, result, '获取分类统计成功');
}

/**
 * GET /api/records/daily-stats
 * 获取月度每日统计（用于折线图）
 */
async function getDailyStats(ctx) {
  const { month } = ctx.query;
  const userId = ctx.state.user.id;

  const result = await recordService.getDailyStats({
    userId,
    month
  });

  resp.success(ctx, result, '获取每日统计成功');
}

/**
 * POST /api/records
 * 创建账单
 */
async function createRecord(ctx) {
  const { categoryId, type, amount, note, recordDate, recordTime } = ctx.request.body;
  const userId = ctx.state.user.id;

  // 参数校验
  if (!categoryId || !type || !amount) {
    return resp.errors.badRequest(ctx, '参数不完整');
  }
  if (![1, 2].includes(parseInt(type))) {
    return resp.errors.validationError(ctx, '类型必须是1(支出)或2(收入)');
  }
  if (parseFloat(amount) <= 0) {
    return resp.errors.validationError(ctx, '金额必须大于0');
  }

  // 获取用户的默认账本
  const account = await recordService.getDefaultAccount(userId);
  if (!account) {
    return resp.errors.notFound(ctx, '未找到默认账本，请先创建账本');
  }

  // 创建账单
  const recordId = await recordService.createRecord({
    userId,
    accountId: account.id,
    categoryId: parseInt(categoryId),
    type: parseInt(type),
    amount: parseFloat(amount),
    note: note || '',
    recordDate: recordDate || new Date().toISOString().split('T')[0],
    recordTime: recordTime || new Date().toTimeString().slice(0, 5)
  });

  resp.success(ctx, { id: recordId }, '创建账单成功');
}

module.exports = {
  getRecords,
  getTodayRecords,
  getMonthSummary,
  getCategoryStats,
  getDailyStats,
  createRecord
};
