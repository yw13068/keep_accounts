/**
 * 应用配置文件
 */
module.exports = {
  // 服务端口
  port: process.env.PORT || 3000,

  // 数据库配置
  database: {
    host: process.env.DB_HOST || '120.48.129.151',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'jszc@123',
    database: process.env.DB_NAME || 'vibe_coding',
    charset: 'utf8mb4'
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'liubai-secret-key-change-in-production',
    expiresIn: '30d' // 30天有效期
  },

  // 密码配置
  password: {
    saltRounds: 10 // bcrypt 加密轮数
  },

  // 登录锁定配置
  login: {
    maxFailAttempts: 5,  // 最多失败次数
    lockMinutes: 10       // 锁定分钟数
  },

  // 验证码配置
  verification: {
    expiresMinutes: 10,   // 验证码有效期（分钟）
    codeLength: 6         // 验证码长度
  }
};
