<template>
  <view class="page">
    <!-- Top AppBar -->
    <header class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <h1 class="title">预算管理</h1>
    </header>

    <main class="main">
      <!-- 月份选择 -->
      <view class="month-selector">
        <view class="month-display">
          <text class="month-label">{{ currentMonthLabel }}</text>
          <text class="arrow-down">▼</text>
        </view>
      </view>

      <!-- 支出预算设置 -->
      <section class="expense-section">
        <view class="section-header">
          <view class="section-title-row">
            <view class="red-bar"></view>
            <text class="section-title">支出预算</text>
          </view>
          <text class="expense-total">总计: ¥ {{ expenseTotal.toLocaleString('zh-CN') }}</text>
        </view>

        <view class="budget-list">
          <view v-for="(item, index) in expenseBudgets" :key="item.id">
            <view class="budget-item">
              <view class="item-left">
                <view class="item-icon-box">
                  <text class="item-icon">{{ item.icon }}</text>
                </view>
                <text class="item-name">{{ item.name }}</text>
              </view>
              <view class="item-right">
                <text class="yuan-sign">¥</text>
                <input
                  type="number"
                  class="budget-input"
                  :value="item.budget || ''"
                  @input="updateExpenseBudget(item.id, $event.detail.value)"
                  placeholder="不限"
                />
              </view>
            </view>
            <view class="item-divider" v-if="index < expenseBudgets.length - 1"></view>
          </view>
        </view>
      </section>

      <text class="quote-text">"合理的预算，是理财的第一步"</text>
    </main>

    <!-- 保存按钮 -->
    <view class="save-btn-container">
      <view class="save-btn" @click="saveBudgets">
        <text class="save-btn-text">保存预算设置</text>
      </view>
    </view>

    <!-- Bottom Nav -->
    <view class="bottom-nav">
      <view class="nav-item" @click="switchTab('home')">
        <text class="nav-icon">🏠</text>
        <text class="nav-label">首页</text>
      </view>
      <view class="nav-item" @click="switchTab('stats')">
        <text class="nav-icon">📊</text>
        <text class="nav-label">统计</text>
      </view>
      <view class="nav-item" @click="switchTab('budget')">
        <text class="nav-icon">📅</text>
        <text class="nav-label">预算</text>
      </view>
      <view class="nav-item active" @click="switchTab('profile')">
        <text class="nav-icon">👤</text>
        <text class="nav-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API, TokenStorage } from '../../lib/api.js'

// 支出分类及其预算
const expenseBudgets = ref([
  { id: 1, name: '餐饮', icon: '🍽️', budget: 0 },
  { id: 2, name: '交通', icon: '🚌', budget: 0 },
  { id: 3, name: '购物', icon: '🛍️', budget: 0 },
  { id: 4, name: '居住', icon: '🏠', budget: 0 },
  { id: 5, name: '娱乐', icon: '🎬', budget: 0 },
  { id: 6, name: '医疗', icon: '🏥', budget: 0 },
  { id: 7, name: '教育', icon: '📚', budget: 0 },
  { id: 8, name: '人情', icon: '❤️', budget: 0 }
])

// 当前月份
let currentDate = new Date()
let apiMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
let displayMonth = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`

const currentMonthLabel = ref(displayMonth)

// 计算支出总计
const expenseTotal = computed(() => {
  return expenseBudgets.value.reduce((sum, b) => sum + (b.budget || 0), 0)
})

// 更新支出预算
function updateExpenseBudget(id, value) {
  const item = expenseBudgets.value.find(b => b.id === id)
  if (item) {
    item.budget = parseInt(value) || 0
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 加载已保存的预算设置
async function loadBudgets() {
  try {
    const res = await API.budget.getMonthBudget(apiMonth)
    if (res.code === 0 && res.data.categories) {
      res.data.categories.forEach(saved => {
        const expense = expenseBudgets.value.find(b => b.id === saved.id)
        if (expense) {
          expense.budget = saved.budget || 0
        }
      })
    }
  } catch (e) {
    console.error('加载预算失败:', e)
  }
}

// 保存预算设置
async function saveBudgets() {
  try {
    for (const item of expenseBudgets.value) {
      await API.budget.saveCategoryBudget({
        month: apiMonth,
        categoryId: item.id,
        amount: item.budget || 0
      })
    }
    uni.showToast({ title: '预算设置已保存', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    console.error('保存预算失败:', e)
    uni.showToast({ title: '保存失败，请重试', icon: 'none' })
  }
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
  if (!uni.getStorageSync('liubai_token')) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  await loadBudgets()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F0E8;
  font-family: 'Noto Serif SC', serif;
  padding-bottom: 240rpx;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 128rpx;
  background-color: rgba(245, 240, 232, 0.8);
  backdrop-filter: blur(24rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-width: 1rpx;
  border-bottom-color: rgba(212, 204, 188, 0.3);
}

.back-btn {
  position: absolute;
  left: 48rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:active {
  opacity: 0.7;
}

.back-icon {
  font-size: 36rpx;
  color: #000;
}

.title {
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  font-weight: 700;
  color: #000;
  letter-spacing: 2rpx;
}

.main {
  max-width: 750rpx;
  margin: 0 auto;
  padding: 0 48rpx;
  padding-top: 160rpx;
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
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

.expense-section {
  margin-bottom: 64rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48rpx;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.red-bar {
  width: 4rpx;
  height: 48rpx;
  background-color: #C0392B;
  border-radius: 100rpx;
}

.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 40rpx;
  font-weight: 600;
  color: #000;
}

.expense-total {
  font-family: 'Noto Serif SC', serif;
  font-size: 26rpx;
  color: #6B6B6B;
}

.budget-list {
  background-color: #ffffff;
  border-radius: 24rpx;
  border-width: 1rpx;
  border-color: rgba(212, 204, 188, 0.3);
  overflow: hidden;
}

.budget-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 40rpx;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.item-icon-box {
  width: 80rpx;
  height: 80rpx;
  background-color: #f7f3f2;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-icon {
  font-size: 40rpx;
}

.item-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  color: #000;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.yuan-sign {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 36rpx;
  color: #6B6B6B;
}

.budget-input {
  width: 192rpx;
  text-align: right;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 36rpx;
  color: #000;
  background: transparent;
  border-bottom-width: 4rpx;
  border-bottom-color: #ebe7e6;
  padding: 8rpx 0;
}

.budget-input:focus {
  border-bottom-color: #000;
  outline: none;
}

.budget-input::placeholder {
  color: #6B6B6B;
}

.item-divider {
  height: 1rpx;
  background-color: rgba(212, 204, 188, 0.2);
  margin-left: 40rpx;
}

.quote-text {
  text-align: center;
  font-family: 'Noto Serif SC', serif;
  font-size: 26rpx;
  color: #6B6B6B;
  opacity: 0.6;
  font-style: italic;
  padding-bottom: 32rpx;
}

.save-btn-container {
  position: fixed;
  bottom: 160rpx;
  left: 0;
  right: 0;
  padding: 0 48rpx;
  z-index: 40;
}

.save-btn {
  width: 100%;
  height: 128rpx;
  background-color: #000;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.save-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.save-btn-text {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
  text-transform: uppercase;
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
</style>
