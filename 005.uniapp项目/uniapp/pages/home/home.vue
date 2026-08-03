<template>
  <view class="page">
    <!-- Top App Bar -->
    <view class="top-bar">
      <text class="top-title">留白记账</text>
    </view>

    <view class="main-content">
      <!-- Month Navigation -->
      <view class="month-nav">
        <view class="month-btn" @click="changeMonth(-1)">
          <text class="month-arrow">‹</text>
        </view>
        <view class="month-picker" @click="toggleMonthPicker">
          <text class="month-label">{{ monthLabel }}</text>
          <text class="month-arrow-down">▾</text>
        </view>
        <view class="month-btn" @click="changeMonth(1)">
          <text class="month-arrow">›</text>
        </view>
      </view>

      <!-- Month Picker Popup -->
      <view v-if="showMonthPicker" class="month-picker-popup" @click="closePicker">
        <view class="picker-card" @click.stop>
          <text class="picker-title">选择月份</text>

          <!-- Year Picker Area -->
          <view v-if="pickerView === 'year'" class="year-picker-area">
            <text class="picker-hint">请选择年份</text>
            <scroll-view class="year-scroll" scroll-y="true">
              <view
                v-for="year in yearList"
                :key="year"
                :class="['year-item', year === selectedYear ? 'active' : '']"
                @click="selectYear(year)"
              >
                <text :class="['year-text', year === selectedYear ? 'active' : '']">{{ year }}年</text>
              </view>
            </scroll-view>
          </view>

          <!-- Month Picker Area -->
          <view v-if="pickerView === 'month'" class="month-picker-area">
            <text class="picker-hint">请选择月份</text>
            <view class="month-grid">
              <view
                v-for="m in 12"
                :key="m"
                :class="['month-item', (m > currentRealMonth && selectedYear === currentYear) ? 'disabled' : '']"
                @click="(m <= currentRealMonth || selectedYear < currentYear) ? selectMonth(m) : ''"
              >
                <text :class="['month-text', m === selectedMonth && selectedYear === currentYear ? 'active' : '']">{{ m }}月</text>
              </view>
            </view>
          </view>

          <view class="btn-row">
            <view v-if="pickerView === 'month'" class="btn-back" @click="pickerView = 'year'">
              <text class="btn-back-text">返回选择年</text>
            </view>
            <view class="btn-cancel" @click="closePicker">
              <text class="btn-cancel-text">取消</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Balance Card -->
      <view class="balance-card">
        <text class="card-label">本月结余</text>
        <text class="balance-amount">¥ {{ balance.toFixed(2) }}</text>
        <view class="income-expense-row">
          <view class="stat-item">
            <text class="stat-label green">收入</text>
            <text class="stat-value green">{{ income.toFixed(2) }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label red">支出</text>
            <text class="stat-value red">{{ expense.toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- Type Toggle -->
      <view class="type-toggle">
        <view class="toggle-container">
          <view :class="['toggle-bg', currentType === 2 ? 'right' : '']"></view>
          <view class="toggle-btn" @click="switchType(1)">
            <text :class="['toggle-text', currentType === 1 ? 'white' : '']">支出</text>
          </view>
          <view class="toggle-btn" @click="switchType(2)">
            <text :class="['toggle-text', currentType === 2 ? 'white' : '']">收入</text>
          </view>
        </view>
      </view>

      <!-- Records List -->
      <view class="records-section">
        <view class="section-header">
          <text class="section-title">{{ monthLabel }}</text>
          <view class="total-wrapper">
            <text :class="['total-amount', currentType === 1 ? 'red' : 'green']">
              {{ currentType === 1 ? '-' : '+' }}¥ {{ totalAmount.toFixed(2) }}
            </text>
          </view>
        </view>
        <view class="brush-divider"></view>

        <!-- Records -->
        <view class="records-list">
          <block v-if="records.length > 0">
            <view
              v-for="record in displayedRecords"
              :key="record.id"
              class="record-item"
            >
              <view class="record-left">
                <view class="record-icon">
                  <text class="icon-text">📋</text>
                </view>
                <view class="record-info">
                  <text class="record-category">{{ record.category?.name || '未知分类' }}</text>
                  <text class="record-note">{{ record.note || '无备注' }}</text>
                </view>
              </view>
              <text :class="['record-amount', record.type === 1 ? 'red' : 'green']">
                {{ record.type === 1 ? '-' : '+' }}{{ record.amount.toFixed(2) }}
              </text>
            </view>
          </block>
          <view v-else class="empty-state">
            <text class="empty-icon">📝</text>
            <text class="empty-text">暂无{{ currentType === 1 ? '支出' : '收入' }}记录</text>
          </view>
        </view>

        <!-- Expand Button -->
        <view v-if="records.length > 10" class="expand-btn" @click="toggleExpand">
          <text class="expand-text">{{ expanded ? '收起全部 ↑' : '展开全部明细 ↓' }}</text>
        </view>
      </view>
    </view>

    <!-- FAB -->
    <view class="fab" @click="goAddRecord">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { API, TokenStorage } from '../../lib/api.js';

const currentType = ref(1);
const currentMonth = ref(new Date().toISOString().slice(0, 7));
const monthLabel = ref('');
const balance = ref(0);
const income = ref(0);
const expense = ref(0);
const records = ref([]);
const expanded = ref(false);
const showMonthPicker = ref(false);
const pickerView = ref('year');
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const currentYear = new Date().getFullYear();
const currentRealMonth = new Date().getMonth() + 1;

const yearList = computed(() => {
  const years = [];
  for (let y = currentYear; y >= currentYear - 14; y--) {
    years.push(y);
  }
  return years;
});

const totalAmount = computed(() => {
  return records.value
    .filter(r => r.type === currentType.value)
    .reduce((sum, r) => sum + r.amount, 0);
});

const displayedRecords = computed(() => {
  return expanded.value ? records.value : records.value.slice(0, 10);
});

function toggleExpand() {
  expanded.value = !expanded.value;
}

function toggleMonthPicker() {
  showMonthPicker.value = !showMonthPicker.value;
  pickerView.value = 'year';
  selectedYear.value = parseInt(currentMonth.value.split('-')[0]);
  selectedMonth.value = parseInt(currentMonth.value.split('-')[1]);
}

function closePicker() {
  showMonthPicker.value = false;
  pickerView.value = 'year';
}

function selectYear(year) {
  selectedYear.value = year;
  pickerView.value = 'month';
}

function selectMonth(m) {
  selectedMonth.value = m;
  currentMonth.value = `${selectedYear.value}-${String(m).padStart(2, '0')}`;
  updateMonthLabel();
  showMonthPicker.value = false;
  loadData();
}

function changeMonth(delta) {
  const [y, m] = currentMonth.value.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  currentMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  updateMonthLabel();
  loadData();
}

function updateMonthLabel() {
  const [y, m] = currentMonth.value.split('-');
  monthLabel.value = `${y}年${parseInt(m)}月`;
}

async function switchType(type) {
  if (currentType.value === type) return;
  currentType.value = type;
  await loadRecords();
}

async function loadData() {
  try {
    const [summaryRes, recordsRes] = await Promise.all([
      API.record.getMonthSummary(currentMonth.value),
      API.record.getMonthRecords(currentType.value, currentMonth.value, 1000)
    ]);
    if (summaryRes.code === 0) {
      income.value = summaryRes.data.income || 0;
      expense.value = summaryRes.data.expense || 0;
      balance.value = summaryRes.data.balance || 0;
    }
    if (recordsRes.code === 0) {
      records.value = recordsRes.data || [];
    }
  } catch (e) {
    console.error('加载数据失败', e);
  }
}

async function loadRecords() {
  try {
    const res = await API.record.getMonthRecords(currentType.value, currentMonth.value, 1000);
    if (res.code === 0) {
      records.value = res.data || [];
    }
  } catch (e) {
    console.error('加载记录失败', e);
  }
}

function goAddRecord() {
  uni.navigateTo({ url: '/pages/add-record/add-record' });
}

onMounted(() => {
  if (!TokenStorage.get()) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }
  updateMonthLabel();
  loadData();
});

// 每次页面显示时刷新数据
onShow(() => {
  if (TokenStorage.get()) {
    loadData();
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F0E8;
  font-family: 'Noto Serif SC', serif;
  padding-bottom: 0;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(88rpx + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  background: rgba(245, 240, 232, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border-bottom: 1px solid rgba(212, 204, 188, 0.3);
}

.top-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1c1b1b;
  letter-spacing: 0.1em;
}

.main-content {
  padding: calc(100rpx + env(safe-area-inset-top)) 48rpx 0;
  max-width: 750rpx;
  margin: 0 auto;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  gap: 24rpx;
}

.month-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-arrow {
  font-size: 48rpx;
  color: #1c1b1b;
  font-weight: 300;
}

.month-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
}

.month-picker:active {
  background: #f7f3f2;
}

.month-label {
  font-size: 32rpx;
  color: #1c1b1b;
}

.month-arrow-down {
  font-size: 20rpx;
  color: #1c1b1b;
}

.month-picker-popup {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-card {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.picker-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1c1b1b;
  text-align: center;
  margin-bottom: 24rpx;
}

.picker-hint {
  font-size: 24rpx;
  color: #6B6B6B;
  text-align: center;
  display: block;
  margin-bottom: 16rpx;
}

.year-picker-area {
  margin-bottom: 24rpx;
}

.year-scroll {
  max-height: 400rpx;
  overflow-y: auto;
}

.year-item {
  padding: 24rpx;
  text-align: center;
  border-radius: 16rpx;
  border: 2rpx solid #ebe7e6;
  background: #fff;
  margin-bottom: 12rpx;
}

.year-item.active {
  background: #000;
  border-color: #000;
}

.year-text {
  font-size: 28rpx;
  color: #1c1b1b;
}

.year-text.active {
  color: #fff;
  font-weight: 700;
}

.month-picker-area {
  margin-bottom: 24rpx;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.month-item {
  padding: 20rpx 0;
  text-align: center;
  border-radius: 16rpx;
  border: 2rpx solid #ebe7e6;
  background: #fff;
}

.month-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.month-text {
  font-size: 28rpx;
  color: #1c1b1b;
}

.month-text.active {
  font-weight: 700;
  color: #000;
}

.month-item.active {
  background: #000;
  border-color: #000;
}

.btn-row {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.btn-back {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  border-radius: 16rpx;
  background: #f7f3f2;
}

.btn-back-text {
  font-size: 28rpx;
  color: #6B6B6B;
}

.btn-cancel {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  border-radius: 16rpx;
  background: #f7f3f2;
}

.btn-cancel-text {
  font-size: 28rpx;
  color: #6B6B6B;
}

.balance-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.card-label {
  font-size: 22rpx;
  color: #6B6B6B;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.balance-amount {
  font-size: 64rpx;
  font-weight: 600;
  color: #1c1b1b;
  letter-spacing: 0.05em;
  font-family: 'Hanken Grotesk', sans-serif;
}

.income-expense-row {
  display: flex;
  gap: 64rpx;
  padding-top: 16rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stat-label.green {
  color: #2E7D5E;
}

.stat-label.red {
  color: #C0392B;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 500;
  font-family: 'Hanken Grotesk', sans-serif;
}

.stat-value.green {
  color: #2E7D5E;
}

.stat-value.red {
  color: #C0392B;
}

.type-toggle {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 32rpx;
}

.toggle-container {
  position: relative;
  display: flex;
  background: #f7f3f2;
  border: 1rpx solid rgba(196, 199, 199, 0.3);
  border-radius: 9999rpx;
  padding: 4rpx;
  width: 384rpx;
}

.toggle-bg {
  position: absolute;
  left: 4rpx;
  top: 4rpx;
  width: calc(50% - 4rpx);
  height: 72rpx;
  background: #000;
  border-radius: 9999rpx;
  transition: transform 0.3s;
  transform: translateX(0);
}

.toggle-bg.right {
  transform: translateX(calc(100% + 4rpx));
}

.toggle-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.toggle-text {
  font-size: 32rpx;
  color: #6B6B6B;
  font-weight: 500;
  transition: color 0.3s;
}

.toggle-text.white {
  color: #fff;
  font-weight: 700;
}

.records-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1c1b1b;
}

.total-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-amount {
  font-size: 36rpx;
  font-weight: 500;
  font-family: 'Hanken Grotesk', sans-serif;
}

.total-amount.red {
  color: #C0392B;
}

.total-amount.green {
  color: #2E7D5E;
}

.brush-divider {
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #D4CCBC 50%, transparent 100%);
  opacity: 0.5;
  margin: 8rpx 0;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.record-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(212, 204, 188, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 40rpx;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-category {
  font-size: 32rpx;
  color: #1c1b1b;
}

.record-note {
  font-size: 26rpx;
  color: #6B6B6B;
}

.record-amount {
  font-size: 36rpx;
  font-weight: 500;
  font-family: 'Hanken Grotesk', sans-serif;
}

.record-amount.red {
  color: #C0392B;
}

.record-amount.green {
  color: #2E7D5E;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  gap: 16rpx;
}

.empty-icon {
  font-size: 72rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #6B6B6B;
}

.expand-btn {
  padding: 24rpx;
  text-align: center;
  border: 1px solid #D4CCBC;
  border-radius: 16rpx;
  margin-top: 16rpx;
}

.expand-btn:active {
  background: #f7f3f2;
}

.expand-text {
  font-size: 26rpx;
  color: #6B6B6B;
}

.fab {
  position: fixed;
  bottom: 123rpx;
  right: 48rpx;
  width: 112rpx;
  height: 112rpx;
  background: #C0392B;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(192, 57, 43, 0.3);
  z-index: 100;
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  font-size: 56rpx;
  color: #fff;
  font-weight: 300;
}
</style>
