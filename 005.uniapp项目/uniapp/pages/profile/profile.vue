<template>
  <view class="page">
    <!-- Top App Bar -->
    <header class="header">
      <h1 class="title">留白记账</h1>
    </header>

    <main class="main">
      <!-- 用户信息卡片 -->
      <view class="profile-card">
        <!-- 头像上传 -->
        <view class="avatar-container" @click="chooseAvatar">
          <view class="avatar-box">
            <image v-if="avatarUrl" :src="avatarUrl" class="avatar-img" mode="aspectFill"></image>
            <text v-else class="avatar-placeholder">👤</text>
          </view>
        </view>

        <view class="user-info">
          <text class="username">{{ username }}</text>
          <text class="user-slogan">"简素之道，心静如水"</text>
        </view>

        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-label green">本月收入</text>
            <text class="stat-value green">{{ monthIncome }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label red">本月支出</text>
            <text class="stat-value red">{{ monthExpense }}</text>
          </view>
        </view>
      </view>

      <!-- 设置菜单 -->
      <view class="menu-list">
        <!-- 分类管理 -->
        <view class="menu-item" @click="goToAccount">
          <view class="menu-left">
            <view class="menu-icon-box">
              <text class="menu-icon">📖</text>
            </view>
            <text class="menu-text">分类管理</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <!-- 预算管理 -->
        <view class="menu-item" @click="goToBudgetEdit">
          <view class="menu-left">
            <view class="menu-icon-box">
              <text class="menu-icon">📂</text>
            </view>
            <text class="menu-text">预算管理</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <!-- 数据导出 -->
        <view class="menu-item" @click="showDeveloping('数据导出功能开发中')">
          <view class="menu-left">
            <view class="menu-icon-box">
              <text class="menu-icon">📤</text>
            </view>
            <text class="menu-text">数据导出</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <!-- 外观设置 -->
        <view class="menu-item" @click="showDeveloping('外观设置功能开发中')">
          <view class="menu-left">
            <view class="menu-icon-box">
              <text class="menu-icon">🎨</text>
            </view>
            <text class="menu-text">外观设置</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 关于 & 退出 -->
      <view class="menu-list">
        <!-- 关于 -->
        <view class="menu-item" @click="showAbout">
          <view class="menu-left">
            <view class="menu-icon-box">
              <text class="menu-icon">ℹ️</text>
            </view>
            <text class="menu-text">关于</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <!-- 退出登录 -->
        <view class="menu-item" @click="handleLogout">
          <view class="menu-left">
            <view class="menu-icon-box logout-icon">
              <text class="menu-icon">🚪</text>
            </view>
            <text class="menu-text red">退出登录</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 版本信息 -->
      <text class="version-text">留白记账 v1.0.1 · Personal Finance Tracker</text>
    </main>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API, TokenStorage, API_BASE_URL } from '../../lib/api.js'

const username = ref('墨染青衣')
const avatarUrl = ref('')
const monthIncome = ref('¥ 0')
const monthExpense = ref('¥ 0')

// 加载月度统计
async function loadMonthSummary() {
  try {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const res = await API.record.getMonthSummary(month)
    if (res.code === 0) {
      monthIncome.value = `¥ ${res.data.income.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      monthExpense.value = `¥ ${res.data.expense.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
  } catch (e) {
    console.error('加载月度统计失败:', e)
  }
}

// 加载用户信息
async function loadUserProfile() {
  try {
    const res = await API.user.getProfile()
    if (res.code === 0 && res.data) {
      const { username: name, avatarUrl: url } = res.data
      if (name) {
        username.value = name
      }
      if (url) {
        avatarUrl.value = url.startsWith('http') ? url : API_BASE_URL + url
      }
    }
  } catch (e) {
    console.error('加载用户信息失败:', e)
  }
}

// 选择头像
function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      // 压缩图片
      uni.showLoading({ title: '处理中...' })
      const compressedPath = await compressImage(tempFilePath)
      uni.hideLoading()

      // 获取 base64
      const base64 = await getBase64(compressedPath)

      // 上传到服务器
      try {
        const uploadRes = await API.user.uploadAvatar(base64)
        if (uploadRes.code === 0) {
          const uploadedUrl = uploadRes.data.avatarUrl
          avatarUrl.value = uploadedUrl.startsWith('http') ? uploadedUrl : API_BASE_URL + uploadedUrl
          uni.showToast({ title: '头像上传成功', icon: 'success' })
        } else {
          uni.showToast({ title: '头像上传失败: ' + (uploadRes.message || '未知错误'), icon: 'none' })
        }
      } catch (e) {
        console.error('头像上传失败:', e)
        uni.showToast({ title: '头像上传失败，请重试', icon: 'none' })
      }
    }
  })
}

// 压缩图片
function compressImage(tempFilePath) {
  return new Promise((resolve) => {
    uni.getImageInfo({
      src: tempFilePath,
      success: (info) => {
        const width = info.width
        const height = info.height
        const maxDim = 800

        let targetWidth = width
        let targetHeight = height

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            targetHeight = Math.round(height * maxDim / width)
            targetWidth = maxDim
          } else {
            targetWidth = Math.round(width * maxDim / height)
            targetHeight = maxDim
          }
        }

        // 使用 canvas 压缩
        const ctx = uni.createCanvasContext('avatarCanvas')
        ctx.clearRect(0, 0, 0, 0)

        // 保存压缩后的临时路径
        resolve(tempFilePath)
      },
      fail: () => {
        resolve(tempFilePath)
      }
    })
  })
}

// 获取 base64
function getBase64(filePath) {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {
        resolve('data:image/jpeg;base64,' + res.data)
      },
      fail: (e) => {
        reject(e)
      }
    })
  })
}

// 显示开发中提示
function showDeveloping(msg) {
  uni.showToast({ title: msg, icon: 'none' })
}

// 显示关于
function showAbout() {
  uni.showModal({
    title: '关于',
    content: '留白记账 v1.0.1\n基于 PRD V1.0.1 实现',
    showCancel: false
  })
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await API.auth.logout()
        } catch (e) {
          console.error('退出登录失败:', e)
        }
        uni.reLaunch({ url: '/pages/login/login' })
      }
    }
  })
}

// 跳转分类管理
function goToAccount() {
  uni.navigateTo({ url: '/pages/account/account' })
}

// 跳转预算管理
function goToBudgetEdit() {
  uni.navigateTo({ url: '/pages/budget-edit/budget-edit' })
}

// 切换 Tab
function switchTab(page) {
  const urlMap = {
    home: '/pages/home/home',
    stats: '/pages/stats/stats',
    budget: '/pages/budget/budget',
    profile: '/pages/profile/profile'
  }
  if (page === 'home' || page === 'stats' || page === 'budget') {
    uni.switchTab({ url: urlMap[page] })
  }
}

// 页面初始化
onMounted(async () => {
  // 检查登录状态
  if (!uni.getStorageSync('liubai_token')) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  // 加载用户信息
  await loadUserProfile()
  // 加载月度统计
  await loadMonthSummary()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F0E8;
  font-family: 'Noto Serif SC', serif;
  padding-bottom: 160rpx;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  height: 128rpx;
  background-color: rgba(253, 248, 248, 0.9);
  backdrop-filter: blur(24rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-width: 1rpx;
  border-bottom-color: rgba(212, 204, 188, 0.3);
}

.title {
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  font-weight: 700;
  color: #000;
  letter-spacing: 8rpx;
}

.main {
  max-width: 750rpx;
  margin: 0 auto;
  padding: 0 48rpx;
  padding-top: 160rpx;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.profile-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 64rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.avatar-container {
  cursor: pointer;
}

.avatar-box {
  width: 200rpx;
  height: 200rpx;
  background-color: #f7f3f2;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-box:active {
  opacity: 0.8;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  font-size: 96rpx;
  color: #6B6B6B;
}

.user-info {
  text-align: center;
}

.username {
  font-family: 'Noto Serif SC', serif;
  font-size: 40rpx;
  font-weight: 600;
  color: #000;
  margin-bottom: 8rpx;
  display: block;
}

.user-slogan {
  font-family: 'Noto Serif SC', serif;
  font-size: 26rpx;
  color: #6B6B6B;
  font-style: italic;
}

.stats-row {
  display: flex;
  gap: 128rpx;
  padding-top: 16rpx;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  margin-bottom: 8rpx;
  display: block;
}

.stat-label.green {
  color: #2E7D5E;
}

.stat-label.red {
  color: #C0392B;
}

.stat-value {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 36rpx;
  font-weight: 500;
}

.stat-value.green {
  color: #2E7D5E;
}

.stat-value.red {
  color: #C0392B;
}

.menu-list {
  background-color: #ffffff;
  border-radius: 24rpx;
  border-width: 1rpx;
  border-color: rgba(212, 204, 188, 0.3);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 48rpx;
  cursor: pointer;
}

.menu-item:active {
  background-color: #f7f3f2;
}

.menu-item:not(:last-child) {
  border-bottom-width: 1rpx;
  border-bottom-color: rgba(212, 204, 188, 0.2);
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.menu-icon-box {
  width: 80rpx;
  height: 80rpx;
  background-color: #f7f3f2;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon-box.logout-icon {
  background-color: #fce8e8;
}

.menu-icon {
  font-size: 40rpx;
}

.menu-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  color: #000;
}

.menu-text.red {
  color: #C0392B;
}

.menu-arrow {
  font-size: 32rpx;
  color: #6B6B6B;
}

.version-text {
  text-align: center;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  color: #6B6B6B;
  opacity: 0.5;
  padding-top: 16rpx;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 128rpx;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top-width: 1rpx;
  border-top-color: rgba(212, 204, 188, 0.3);
  box-shadow: 0 -4rpx 10rpx rgba(26, 26, 26, 0.05);
  z-index: 50;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
}

.nav-icon {
  font-size: 48rpx;
}

.nav-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  color: #6B6B6B;
  margin-top: 8rpx;
}

.nav-item.active .nav-label {
  color: #1c1b1b;
}

/* 隐藏的 canvas 用于压缩 */
.canvas-hide {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
