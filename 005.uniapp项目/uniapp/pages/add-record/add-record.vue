<template>
  <view class="page">
    <!-- 半透明背景 -->
    <view class="overlay" @tap="closeDrawer"></view>

    <!-- 抽屉主体 -->
    <view class="drawer">
      <!-- 把手 -->
      <view class="handle">
        <view class="handle-bar"></view>
      </view>

      <!-- 金额显示 -->
      <view class="amount-section">
        <view class="amount-row">
          <text class="amount-prefix" :style="{ color: currentType === 'expense' ? '#C0392B' : '#2E7D5E' }">¥</text>
          <input
            type="digit"
            v-model="amountDisplay"
            class="amount-input"
            :style="{ color: currentType === 'expense' ? '#C0392B' : '#2E7D5E' }"
            placeholder="0.00"
            placeholder-class="amount-placeholder"
          />
        </view>
        <view class="brush-divider"></view>
      </view>

      <!-- 支出/收入切换 -->
      <view class="type-toggle">
        <view class="toggle-bg">
          <view
            class="toggle-indicator"
            :style="{ transform: currentType === 'expense' ? 'translateX(0)' : 'translateX(176rpx)' }"
          ></view>
          <view class="toggle-btn" @tap="switchType('expense')">
            <text class="toggle-text" :class="{ active: currentType === 'expense' }">支出</text>
          </view>
          <view class="toggle-btn" @tap="switchType('income')">
            <text class="toggle-text" :class="{ active: currentType === 'income' }">收入</text>
          </view>
        </view>
      </view>

      <!-- 分类选择 -->
      <view class="category-section">
        <text class="category-label">选择分类</text>
        <view class="category-grid">
          <view
            v-for="cat in currentCategories"
            :key="cat.id"
            class="category-item"
            @tap="selectCategory(cat.id)"
          >
            <view
              class="category-icon"
              :class="{ selected: selectedCategoryId === cat.id }"
            >
              <text class="category-emoji">{{ cat.icon }}</text>
            </view>
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </view>

      <!-- 日期 & 备注 -->
      <view class="input-section">
        <view class="input-row" @tap="pickDate">
          <text class="input-icon">📅</text>
          <text class="date-text">{{ dateDisplay }}</text>
        </view>
        <view class="input-row">
          <text class="input-icon">📝</text>
          <input
            type="text"
            v-model="note"
            placeholder="添加备注"
            class="note-input"
            placeholder-class="note-placeholder"
          />
        </view>
      </view>

      <!-- 确认按钮 -->
      <view class="save-section">
        <view
          class="save-btn"
          :class="{ disabled: saving }"
          @tap="saveRecord"
        >
          <text class="save-icon">✓</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { API, TokenStorage } from '../../lib/api.js'

// 支出分类
const expenseCategories = [
  { id: 1, name: '餐饮', icon: '🍜' },
  { id: 2, name: '交通', icon: '🚌' },
  { id: 3, name: '购物', icon: '🛍️' },
  { id: 4, name: '居住', icon: '🏠' },
  { id: 5, name: '娱乐', icon: '🎬' },
  { id: 6, name: '医疗', icon: '🏥' },
  { id: 7, name: '教育', icon: '📚' },
  { id: 8, name: '人情', icon: '❤️' },
]

// 收入分类
const incomeCategories = [
  { id: 14, name: '工资', icon: '💰' },
  { id: 15, name: '奖金', icon: '🎁' },
  { id: 16, name: '兼职', icon: '💼' },
  { id: 17, name: '理财', icon: '📈' },
]

const currentType = ref('expense')
const amountDisplay = ref('')
const amountValue = ref(0)
const note = ref('')
const dateDisplay = ref('')
const selectedCategoryId = ref(1)
const saving = ref(false)

const currentCategories = computed(() => {
  return currentType.value === 'expense' ? expenseCategories : incomeCategories
})

// 监听金额输入，更新 amountValue
watch(amountDisplay, (newVal) => {
  let value = String(newVal).replace(/[^\d.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  if (parts[1] && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2)
  }
  amountDisplay.value = value
  amountValue.value = parseFloat(value) || 0
})

function switchType(type) {
  currentType.value = type
  const cats = type === 'expense' ? expenseCategories : incomeCategories
  selectedCategoryId.value = cats[0].id
}

function selectCategory(id) {
  selectedCategoryId.value = id
}

function closeDrawer() {
  uni.switchTab({ url: '/pages/home/home' })
}

async function pickDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()

  const res = await new Promise((resolve) => {
    uni.showDatePicker({
      currentDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      success: (res) => resolve(res),
      fail: () => resolve(null),
    })
  })

  if (res && res.year !== undefined) {
    const hour = now.getHours()
    const minute = now.getMinutes()
    dateDisplay.value = `${res.year}年${res.month}月${res.day}日 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }
}

async function saveRecord() {
  if (saving.value) return

  if (!amountValue.value || amountValue.value <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }

  saving.value = true

  try {
    const res = await API.record.createRecord({
      categoryId: selectedCategoryId.value,
      type: currentType.value === 'expense' ? 1 : 2,
      amount: amountValue.value,
      note: note.value,
    })

    if (res.code === 0) {
      uni.switchTab({ url: '/pages/home/home' })
    } else {
      uni.showToast({ title: res.message || '保存失败', icon: 'none' })
      saving.value = false
    }
  } catch (e) {
    uni.showToast({ title: '保存失败: ' + e.message, icon: 'none' })
    saving.value = false
  }
}

onMounted(() => {
  // 检查登录状态
  const token = uni.getStorageSync('liubai_token')
  if (!token) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }

  // 初始化日期
  const now = new Date()
  dateDisplay.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})
</script>

<style scoped>
.page {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4rpx);
}

.drawer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 750rpx;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 64rpx 64rpx 0 0;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.handle {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 32rpx 0 16rpx;
}

.handle-bar {
  width: 96rpx;
  height: 8rpx;
  background-color: #D4CCBC;
  border-radius: 4rpx;
  opacity: 0.6;
}

.amount-section {
  padding: 32rpx 48rpx 16rpx;
  text-align: center;
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.amount-prefix {
  font-family: 'PingFang SC', sans-serif;
  font-size: 48rpx;
  font-weight: 600;
  opacity: 0.6;
  line-height: 1;
}

.amount-input {
  font-family: 'PingFang SC', sans-serif !important;
  font-size: 48rpx !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  text-align: center !important;
  min-width: 360rpx !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: #000000 !important;
  -webkit-appearance: none !important;
  appearance: none !important;
}

.amount-placeholder {
  color: #D4CCBC;
  font-size: 18rpx;
}

.brush-divider {
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #D4CCBC 50%, transparent 100%);
  width: 160rpx;
  margin: 24rpx auto 0;
}

.type-toggle {
  display: flex;
  justify-content: center;
  padding: 32rpx 0;
}

.toggle-bg {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f1edec;
  border-radius: 100rpx;
  border: 2rpx solid rgba(196, 199, 199, 0.3);
  width: 384rpx;
  padding: 4rpx;
}

.toggle-indicator {
  position: absolute;
  left: 4rpx;
  top: 4rpx;
  bottom: 4rpx;
  width: 184rpx;
  background-color: #000000;
  border-radius: 100rpx;
  transition: transform 0.3s ease;
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  z-index: 10;
}

.toggle-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  color: #6B6B6B;
}

.toggle-text.active {
  color: #ffffff;
  font-weight: 500;
}

.category-section {
  padding: 0 48rpx 32rpx;
  flex: 1;
  overflow-y: auto;
}

.category-label {
  display: block;
  font-family: 'PingFang SC', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6B6B6B;
  text-align: center;
  margin-bottom: 24rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  text-align: center;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.category-icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(212, 204, 188, 0.4);
  transition: all 0.2s ease;
  background-color: #f1edec;
}

.category-icon.selected {
  border: 4rpx solid #000000;
  background-color: #e7e2da;
}

.category-emoji {
  font-size: 48rpx;
  line-height: 1;
}

.category-name {
  font-family: 'PingFang SC', sans-serif;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6B6B6B;
}

.input-section {
  padding: 0 48rpx;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding: 24rpx 0;
  border-bottom: 2rpx solid rgba(212, 204, 188, 0.3);
}

.input-icon {
  font-size: 40rpx;
  line-height: 1;
}

.date-text {
  flex: 1;
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  color: #000000;
}

.note-input {
  flex: 1;
  font-family: 'Noto Serif SC', serif;
  font-size: 32rpx;
  color: #000000;
  background: transparent;
}

.note-placeholder {
  color: #6B6B6B;
}

.save-section {
  display: flex;
  justify-content: center;
  padding: 48rpx 0 64rpx;
}

.save-btn {
  width: 128rpx;
  height: 128rpx;
  background-color: #C0392B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(192, 57, 43, 0.3);
  transition: all 0.2s ease;
}

.save-btn.disabled {
  opacity: 0.5;
}

.save-icon {
  font-size: 48rpx;
  color: #ffffff;
  font-weight: bold;
}
</style>
