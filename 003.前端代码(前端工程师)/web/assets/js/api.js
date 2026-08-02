/**
 * API 工具类
 * 封装所有与后端的 API 交互
 */
// API 地址配置
const API_BASE_URL = (function() {
  // 本地开发环境（电脑浏览器直接打开html文件）
  const localDev = 'http://localhost:3000';
  // 服务器地址 - 请修改为实际的后端服务器地址
  const serverHost = '120.48.129.151';
  const serverPort = '3000';
  const remoteApi = `http://${serverHost}:${serverPort}`;

  // 判断是否在本地访问
  const isLocal = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  window.location.protocol === 'file:';

  return isLocal ? localDev : remoteApi;
})();

// 存储 Token
const TokenStorage = {
  KEY: 'liubai_token',

  get() {
    return localStorage.getItem(this.KEY);
  },

  set(token) {
    localStorage.setItem(this.KEY, token);
  },

  remove() {
    localStorage.removeItem(this.KEY);
  }
};

// API 请求封装
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = TokenStorage.get();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      // 处理特定错误
      if (response.status === 401) {
        TokenStorage.remove();
        // 可以在这里添加跳转登录页的逻辑
      }
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// API 方法
const API = {
  // 认证相关
  auth: {
    // 用户注册
    async register({ phone, username, password }) {
      const data = await request('/api/auth/register', {
        method: 'POST',
        body: { phone, username, password }
      });
      if (data.data && data.data.token) {
        TokenStorage.set(data.data.token);
      }
      return data;
    },

    // 用户登录
    async login({ phone, password }) {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: { phone, password }
      });
      if (data.data && data.data.token) {
        TokenStorage.set(data.data.token);
      }
      return data;
    },

    // 发送验证码
    async sendCode(phone) {
      return request('/api/auth/send-code', {
        method: 'POST',
        body: { phone }
      });
    },

    // 重置密码
    async resetPassword({ phone, code, newPassword }) {
      return request('/api/auth/reset-password', {
        method: 'POST',
        body: { phone, code, newPassword }
      });
    },

    // 获取当前用户信息
    async getProfile() {
      return request('/api/user/profile');
    },

    // 退出登录
    logout() {
      TokenStorage.remove();
      window.location.href = 'login.html';
    }
  },

  // 账单相关
  record: {
    // 获取今日账单
    async getToday(type) {
      const query = type !== null ? `?type=${type}` : '';
      return request(`/api/records/today${query}`);
    },

    // 获取月度账单
    async getMonthRecords(type, month, pageSize = 10) {
      const params = new URLSearchParams();
      if (type !== null && type !== undefined) params.append('type', type);
      if (month) params.append('month', month);
      params.append('pageSize', pageSize);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request(`/api/records${query}`);
    },

    // 获取本月统计
    async getMonthSummary(month) {
      const query = month ? `?month=${month}` : '';
      return request(`/api/records/month${query}`);
    },

    // 获取分类统计（用于饼图）
    async getCategoryStats(type, month) {
      const params = new URLSearchParams();
      params.append('type', type);
      if (month) params.append('month', month);
      const query = `?${params.toString()}`;
      return request(`/api/records/category-stats${query}`);
    },

    // 获取月度每日统计（用于折线图）
    async getDailyStats(month) {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request(`/api/records/daily-stats${query}`);
    },

    // 创建账单
    async createRecord({ categoryId, type, amount, note, recordDate, recordTime }) {
      return request('/api/records', {
        method: 'POST',
        body: { categoryId, type, amount, note, recordDate, recordTime }
      });
    },

    // 获取账单列表
    async getList({ type, month, page, pageSize } = {}) {
      const params = new URLSearchParams();
      if (type !== null && type !== undefined) params.append('type', type);
      if (month) params.append('month', month);
      if (page) params.append('page', page);
      if (pageSize) params.append('pageSize', pageSize);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request(`/api/records${query}`);
    }
  },

  // 预算相关
  budget: {
    // 获取月度预算数据
    async getMonthBudget(month) {
      const query = month ? `?month=${month}` : '';
      return request(`/api/budgets/month${query}`);
    },

    // 保存分类预算
    async saveCategoryBudget({ month, categoryId, amount, warnPercent }) {
      return request('/api/budgets', {
        method: 'POST',
        body: { month, categoryId, amount, warnPercent }
      });
    }
  },

  // 用户相关
  user: {
    // 获取用户信息
    async getProfile() {
      return request('/api/user/profile');
    },

    // 上传头像（base64 格式）
    async uploadAvatar(avatarBase64) {
      return request('/api/user/avatar', {
        method: 'POST',
        body: { avatar: avatarBase64 }
      });
    }
  }
};

// 导出
window.API = API;
window.TokenStorage = TokenStorage;
window.API_BASE_URL = API_BASE_URL;
