<template>
  <view class="page">
    <!-- Top App Bar -->
    <header class="header">
      <h1 class="title">留白记账</h1>
    </header>

    <main class="main">
      <!-- 月份选择 -->
      <view class="month-selector">
        <view class="arrow-btn" @click="changeMonth(-1)">
          <text class="arrow-icon">◀</text>
        </view>
        <view class="month-display" @click="showMonthPicker">
          <text class="month-label">{{ currentMonthLabel }}</text>
          <text class="arrow-down">▼</text>
        </view>
        <view class="arrow-btn" @click="changeMonth(1)">
          <text class="arrow-icon">▶</text>
        </view>
      </view>

      <!-- 预算概览卡片 -->
      <view class="overview-card">
        <view class="overview-label">本月预算进度</view>
        <view class="overview-center">
          <text class="percent-display">{{ budgetPercent }}</text>
          <text class="percent-unit">%</text>
        </view>
        <view class="spent-text">
          已使用 <text class="amount">{{ budgetSpent }}</text> / <text class="amount">{{ budgetTotal }}</text>
        </view>
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: progressWidth + '%', backgroundColor: progressColor }"></view>
        </view>
        <view class="overview-footer">
          <text class="remain-text">剩余 {{ budgetRemain }}</text>
          <text class="warning-text" v-if="showWarning">⚠ 接近预警线</text>
        </view>
      </view>

      <!-- 分类预算列表 -->
      <view class="category-section">
        <text class="section-title">分类预算</text>
        <view class="category-list" v-if="configuredCategories.length > 0">
          <view v-for="(cat, index) in configuredCategories" :key="cat.id">
            <view class="category-item">
              <view class="category-left">
                <view class="category-icon-box">
                  <text class="category-icon">{{ getIconEmoji(cat.icon) }}</text>
                </view>
                <text class="category-name">{{ cat.name }}</text>
              </view>
              <text class="category-budget-text">{{ cat.spentText }} / {{ cat.budgetText }}</text>
            </view>
            <view class="category-progress-bg">
              <view class="category-progress-fill" :style="{ width: cat.displayPercent + '%', backgroundColor: cat.progressColor }"></view>
            </view>
            <view class="divider" v-if="index < configuredCategories.length - 1"></view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-text">暂未配置预算</text>
          <text class="empty-hint">点击底部导航"我的"→"预算管理"去设置</text>
        </view>
      </view>

      <text class="quote-text">"预算不是束缚，而是自由的基石。"</text>
    </main>

    <!-- FAB -->
    <view class="fab" @click="goToAddRecord">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { API, TokenStorage } from '../../lib/api.js'

// 图标映射到 emoji
const getIconEmoji = (icon) => {
  const iconMap = {
    'restaurant': '🍜',
    'directions_bus': '🚌',
    'shopping_bag': '🛍',
    'home': '🏠',
    'movie': '🎬',
    'health_and_safety': '🏥',
    'school': '📚',
    'pets': '🐾',
    'flight': '✈️',
    'fitness_center': '💪',
    'spa': '🧘',
    'music_note': '🎵',
    'book': '📖',
    'coffee': '☕',
    'local_bar': '🍸',
    'sports_esports': '🎮',
    'attach_money': '💰',
    'savings': '🏦',
    'card_giftcard': '🎁',
    'redeem': '🎁',
    'trending_up': '📈',
    'account_balance_wallet': '💳',
    'payments': '💵',
    'work': '💼',
    'business_center': '🏢',
    'local_atm': '🏧',
    'favorite': '❤️',
    'lock_reset': '🔑',
    'smartphone': '📱',
    'chat': '💬',
    'lock': '🔒',
    'verified_user': '✓',
    'visibility_off': '👁',
    'visibility': '👁',
    'check_circle': '✓',
    'arrow_back_ios_new': '←',
    'add': '+',
    'close': '✕',
    'analytics': '📊',
    'calendar_today': '📅',
    'person': '👤',
  }
  return iconMap[icon] || '📌'
}

// 当前月份
let currentDate = new Date()
let currentMonth = ref(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)

// 数据显示
const budgetPercent = ref('--')
const budgetSpent = ref('¥ --')
const budgetTotal = ref('¥ --')
const budgetRemain = ref('¥ --')
const showWarning = ref(false)
const categories = ref([])

// 计算属性
const currentMonthLabel = computed(() => {
  const [year, month] = currentMonth.value.split('-')
  return `${year}年${parseInt(month)}月`
})

const progressWidth = computed(() => {
  if (budgetPercent.value === '--') return 0
  return Math.min(parseInt(budgetPercent.value), 100)
})

const progressColor = computed(() => {
  if (budgetPercent.value === '--') return '#2E7D5E'
  const p = parseInt(budgetPercent.value)
  if (p >= 100) return '#C0392B'
  if (p >= 80) return '#B7610A'
  return '#2E7D5E'
})

const configuredCategories = computed(() => {
  return categories.value
    .filter(cat => cat.budget > 0)
    .map(cat => {
      const percent = cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0
      const displayPercent = Math.min(percent, 100)
      let progressColor = '#2E7D5E'
      if (percent >= 100) progressColor = '#C0392B'
      else if (percent >= 80) progressColor = '#B7610A'
      return {
        ...cat,
        percent,
        displayPercent,
        progressColor,
        spentText: `¥ ${cat.spent.toLocaleString('zh-CN')}`,
        budgetText: `¥ ${cat.budget.toLocaleString('zh-CN')}`
      }
    })
})

// 切换月份
function changeMonth(delta) {
  const [year, month] = currentMonth.value.split('-').map(Number)
  const newDate = new Date(year, month - 1 + delta, 1)
  currentMonth.value = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
  loadBudgetData()
}

// 显示月份选择器
function showMonthPicker() {
  // 简化的月份选择，实际可用 picker 组件
  uni.showToast({ title: '请使用左右箭头切换月份', icon: 'none' })
}

// 加载预算数据
async function loadBudgetData() {
  try {
    const res = await API.budget.getMonthBudget(currentMonth.value)
    if (res.code === 0) {
      renderOverview(res.data)
      categories.value = res.data.categories || []

      // 检查是否有分类达到80%预警
      const warningCats = (res.data.categories || []).filter(cat => {
        return cat.budget > 0 && (cat.spent / cat.budget) >= 0.8 && (cat.spent / cat.budget) < 1
      })
      if (warningCats.length > 0) {
        const names = warningCats.map(c => c.name).join('、')
        setTimeout(() => {
          uni.showToast({ title: `⚠️ 预算预警：${names} 已超过80%！`, icon: 'none' })
        }, 500)
      }
    } else {
      console.error('加载预算数据失败:', res.message)
    }
  } catch (e) {
    console.error('加载预算数据失败:', e)
  }
}

// 渲染总览数据
function renderOverview(data) {
  const percent = data.percent || 0
  const spent = data.totalSpent || 0
  const total = data.totalBudget || 0
  const remain = total - spent

  budgetPercent.value = total > 0 ? percent : '--'
  budgetSpent.value = total > 0 ? `¥ ${spent.toLocaleString('zh-CN')}` : '¥ --'
  budgetTotal.value = total > 0 ? `¥ ${total.toLocaleString('zh-CN')}` : '未设置'
  budgetRemain.value = total > 0 ? `¥ ${remain.toLocaleString('zh-CN')}` : '¥ --'

  // 预警提示
  showWarning.value = percent >= 80 && total > 0
}

// 跳转新增记录
function goToAddRecord() {
  uni.navigateTo({ url: '/pages/add-record/add-record' })
}

// 切换 Tab
function switchTab(page) {
  const urlMap = {
    home: '/pages/home/home',
    stats: '/pages/stats/stats',
    budget: '/pages/budget/budget',
    profile: '/pages/profile/profile'
  }
  if (page === 'home' || page === 'stats' || page === 'profile') {
    uni.switchTab({ url: urlMap[page] })
  }
}

// 页面初始化
onMounted(() => {
  // 检查登录状态
  if (!uni.getStorageSync('liubai_token')) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  loadBudgetData()
})

// 每次页面显示时刷新数据
onShow(() => {
  if (uni.getStorageSync('liubai_token')) {
    loadBudgetData()
  }
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
  height: calc(88rpx + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
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
  padding-top: calc(160rpx + env(safe-area-inset-top));
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
}

.arrow-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}

.arrow-btn:active {
  background-color: #f7f3f2;
}

.arrow-icon {
  font-size: 36rpx;
  color: #000;
}

.month-display {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
}

.month-display:active {
  background-color: #f7f3f2;
}

.month-label {
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  color: #000;
}

.arrow-down {
  font-size: 20rpx;
  color: #1c1b1b;
}

.overview-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.overview-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  color: #6B6B6B;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.overview-center {
  text-align: center;
}

.percent-display {
  font-family: 'PingFang SC', sans-serif;
  font-size: 96rpx;
  font-weight: 600;
  color: #000;
  letter-spacing: 2rpx;
}

.percent-unit {
  font-family: 'PingFang SC', sans-serif;
  font-size: 48rpx;
  color: #000;
}

.spent-text {
  text-align: center;
  font-family: 'Noto Serif SC', serif;
  font-size: 26rpx;
  color: #6B6B6B;
  margin-top: 8rpx;
}

.amount {
  color: #000;
}

.progress-bar-bg {
  height: 8rpx;
  background-color: #ebe7e6;
  border-radius: 100rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 100rpx;
  transition: all 0.3s ease;
}

.overview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remain-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  color: #6B6B6B;
}

.warning-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  color: #B7610A;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 40rpx;
  font-weight: 600;
  color: #000;
}

.category-list {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.category-icon-box {
  width: 72rpx;
  height: 72rpx;
  background-color: #f7f3f2;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-icon {
  font-size: 36rpx;
}

.category-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  font-weight: 500;
  color: #000;
}

.category-budget-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  color: #000;
}

.category-progress-bg {
  height: 6rpx;
  background-color: #ebe7e6;
  border-radius: 100rpx;
  overflow: hidden;
  margin-top: 8rpx;
}

.category-progress-fill {
  height: 100%;
  border-radius: 100rpx;
}

.divider {
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #D4CCBC 20%, #D4CCBC 80%, transparent 100%);
  opacity: 0.3;
  margin-top: 24rpx;
}

.empty-state {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
}

.empty-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 26rpx;
  color: #6B6B6B;
}

.empty-hint {
  font-family: 'Noto Serif SC', serif;
  font-size: 22rpx;
  color: #6B6B6B;
  opacity: 0.6;
  margin-top: 8rpx;
  display: block;
}

.quote-text {
  text-align: center;
  font-family: 'Noto Serif SC', serif;
  font-size: 26rpx;
  color: #6B6B6B;
  opacity: 0.6;
  font-style: italic;
  padding-top: 48rpx;
}

.fab {
  position: fixed;
  bottom: 123rpx;
  right: 48rpx;
  width: 112rpx;
  height: 112rpx;
  background-color: #C0392B;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(192, 57, 43, 0.3);
  z-index: 40;
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: 300;
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
  font-family: 'PingFang SC', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  color: #6B6B6B;
  margin-top: 8rpx;
}

.nav-item.active .nav-label {
  color: #1c1b1b;
}
</style>
