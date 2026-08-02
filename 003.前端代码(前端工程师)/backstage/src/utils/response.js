/**
 * 统一响应格式工具
 */

/**
 * 成功响应
 * @param {Object} ctx - Koa context
 * @param {any} data - 响应数据
 * @param {string} message - 成功消息
 */
function success(ctx, data = null, message = '操作成功') {
  ctx.status = 200;
  ctx.body = {
    code: 0,
    message,
    data
  };
}

/**
 * 分页响应
 * @param {Object} ctx - Koa context
 * @param {Object} result - 查询结果 { list, total, page, pageSize }
 * @param {string} message - 成功消息
 */
function successWithPage(ctx, result, message = '查询成功') {
  ctx.status = 200;
  ctx.body = {
    code: 0,
    message,
    data: {
      list: result.list,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total
      }
    }
  };
}

/**
 * 错误响应
 * @param {Object} ctx - Koa context
 * @param {number} status - HTTP 状态码
 * @param {string} message - 错误消息
 * @param {string} code - 业务错误码
 */
function error(ctx, status = 500, message = '服务器内部错误', code = 'INTERNAL_ERROR') {
  ctx.status = status;
  ctx.body = {
    code,
    message,
    data: null
  };
}

/**
 * 常用错误快捷方法
 */
const errors = {
  // 400 参数错误
  badRequest(ctx, message = '参数错误') {
    error(ctx, 400, message, 'BAD_REQUEST');
  },

  // 401 未授权
  unauthorized(ctx, message = '未登录或登录已过期') {
    error(ctx, 401, message, 'UNAUTHORIZED');
  },

  // 403 禁止访问
  forbidden(ctx, message = '无权限访问') {
    error(ctx, 403, message, 'FORBIDDEN');
  },

  // 404 资源不存在
  notFound(ctx, message = '资源不存在') {
    error(ctx, 404, message, 'NOT_FOUND');
  },

  // 409 冲突
  conflict(ctx, message = '资源冲突') {
    error(ctx, 409, message, 'CONFLICT');
  },

  // 422 验证失败
  validationError(ctx, message = '验证失败') {
    error(ctx, 422, message, 'VALIDATION_ERROR');
  },

  // 500 服务器错误
  internal(ctx, message = '服务器内部错误') {
    error(ctx, 500, message, 'INTERNAL_ERROR');
  }
};

module.exports = {
  success,
  successWithPage,
  error,
  errors
};
