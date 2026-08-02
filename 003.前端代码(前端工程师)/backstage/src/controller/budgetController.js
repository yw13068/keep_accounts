/**
 * 预算 Controller
 */
const budgetService = require('../service/budgetService');
const resp = require('../utils/response');

/**
 * GET /api/budgets/month
 * 获取指定月份的预算数据
 */
async function getMonthBudget(ctx) {
  const { month } = ctx.query;
  const userId = ctx.state.user.id;

  const result = await budgetService.getMonthBudget({ userId, month });
  resp.success(ctx, result, '获取预算数据成功');
}

/**
 * POST /api/budgets
 * 创建或更新预算
 */
async function upsertBudget(ctx) {
  const { month, categoryId, amount, warnPercent } = ctx.request.body;
  const userId = ctx.state.user.id;

  if (!month || amount === undefined) {
    return resp.errors.badRequest(ctx, '参数不完整');
  }

  await budgetService.upsertBudget({ userId, month, categoryId, amount, warnPercent });
  resp.success(ctx, null, '预算保存成功');
}

module.exports = {
  getMonthBudget,
  upsertBudget
};
