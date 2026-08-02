/**
 * API 工具类 - 适配 UniApp
 */
const API_BASE_URL = 'http://127.0.0.1:3000';

// Token 存储
const TokenStorage = {
  KEY: 'liubai_token',
  get() {
    return uni.getStorageSync(this.KEY) || '';
  },
  set(token) {
    uni.setStorageSync(this.KEY, token);
  },
  remove() {
    uni.removeStorageSync(this.KEY);
  }
};

// 请求封装
function request(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = API_BASE_URL + endpoint;
    const token = TokenStorage.get();

    const header = {
      'Content-Type': 'application/json',
      ...options.header
    };
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    uni.request({
      url,
      method: options.method || 'GET',
      header,
      data: options.data || undefined,
      success: (res) => {
        if (res.statusCode === 401) {
          TokenStorage.remove();
          uni.reLaunch({ url: '/pages/login/login' });
          return reject(new Error('未授权'));
        }
        if (res.statusCode >= 400) {
          return reject(new Error(res.data?.message || '请求失败'));
        }
        resolve(res.data);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// API 方法
const API = {
  auth: {
    async register({ phone, username, password }) {
      const data = await request('/api/auth/register', {
        method: 'POST',
        data: { phone, username, password }
      });
      if (data.data?.token) {
        TokenStorage.set(data.data.token);
      }
      return data;
    },
    async login({ phone, password }) {
      const data = await request('/api/auth/login', {
        method: 'POST',
        data: { phone, password }
      });
      if (data.data?.token) {
        TokenStorage.set(data.data.token);
      }
      return data;
    },
    async sendCode(phone) {
      return request('/api/auth/send-code', {
        method: 'POST',
        data: { phone }
      });
    },
    async resetPassword({ phone, code, newPassword }) {
      return request('/api/auth/reset-password', {
        method: 'POST',
        data: { phone, code, newPassword }
      });
    },
    logout() {
      TokenStorage.remove();
      uni.reLaunch({ url: '/pages/login/login' });
    }
  },

  record: {
    async getToday(type) {
      const query = type !== null ? `?type=${type}` : '';
      return request(`/api/records/today${query}`);
    },
    async getMonthRecords(type, month, pageSize = 10) {
      const params = [];
      if (type !== null && type !== undefined) params.push(`type=${type}`);
      if (month) params.push(`month=${month}`);
      params.push(`pageSize=${pageSize}`);
      const query = '?' + params.join('&');
      return request(`/api/records${query}`);
    },
    async getMonthSummary(month) {
      const query = month ? `?month=${month}` : '';
      return request(`/api/records/month${query}`);
    },
    async getCategoryStats(type, month) {
      const query = `?type=${type}${month ? '&month=' + month : ''}`;
      return request(`/api/records/category-stats${query}`);
    },
    async getDailyStats(month) {
      const query = month ? `?month=${month}` : '';
      return request(`/api/records/daily-stats${query}`);
    },
    async createRecord({ categoryId, type, amount, note, recordDate, recordTime }) {
      return request('/api/records', {
        method: 'POST',
        data: { categoryId, type, amount, note, recordDate, recordTime }
      });
    },
    async getList({ type, month, page, pageSize } = {}) {
      const params = [];
      if (type !== null && type !== undefined) params.push(`type=${type}`);
      if (month) params.push(`month=${month}`);
      if (page) params.push(`page=${page}`);
      if (pageSize) params.push(`pageSize=${pageSize}`);
      const query = params.length ? '?' + params.join('&') : '';
      return request(`/api/records${query}`);
    }
  },

  budget: {
    async getMonthBudget(month) {
      const query = month ? `?month=${month}` : '';
      return request(`/api/budgets/month${query}`);
    },
    async saveCategoryBudget({ month, categoryId, amount, warnPercent }) {
      return request('/api/budgets', {
        method: 'POST',
        data: { month, categoryId, amount, warnPercent }
      });
    }
  },

  user: {
    async getProfile() {
      return request('/api/user/profile');
    },
    async uploadAvatar(avatarBase64) {
      return request('/api/user/avatar', {
        method: 'POST',
        data: { avatar: avatarBase64 }
      });
    }
  }
};

export { API, TokenStorage, API_BASE_URL };
