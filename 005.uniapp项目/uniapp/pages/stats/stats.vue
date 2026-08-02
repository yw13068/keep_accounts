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
          <text class="arrow">‹</text>
        </view>
        <view class="month-picker" @click="togglePicker">
          <text class="month-label">{{ monthLabel }}</text>
          <text class="arrow-down">▾</text>
        </view>
        <view class="month-btn" @click="changeMonth(1)">
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- Month Picker Popup -->
      <view v-if="showPicker" class="picker-overlay" @click="showPicker = false">
        <view class="picker-card" @click.stop>
          <text class="picker-title">选择月份</text>
          <view class="year-list">
            <view
              v-for="year in yearList"
              :key="year"
              :class="['year-item', year === selectedYear ? 'active' : '']"
              @click="selectYear(year)"
            >
              <text :class="['year-text', year === selectedYear ? 'active' : '']">{{ year }}年</text>
            </view>
          </view>
          <view class="month-grid" v-if="selectedYear">
            <view
              v-for="m in 12"
              :key="m"
              :class="['month-item', (m > currentRealMonth && year === currentYear) ? 'disabled' : '']"
              @click="(m <= currentRealMonth || year < currentYear) ? selectMonth(m) : ''"
            >
              <text :class="['month-text', m === selectedMonth && year === selectedYear ? 'active' : '']">{{ m }}月</text>
            </view>
          </view>
          <view class="cancel-btn" @click="showPicker = false">
            <text class="cancel-text">取消</text>
          </view>
        </view>
      </view>

      <!-- Line Chart Card -->
      <view class="chart-card">
        <text class="chart-title">{{ monthLabel }}支出收入对比</text>
        <view class="chart-wrapper">
          <svg v-if="chartData.length > 0" class="line-svg" viewBox="0 0 320 200">
            <line v-for="(grid, i) in gridLines" :key="'g'+i"
              :x1="grid.x1" :y1="grid.y1" :x2="grid.x2" :y2="grid.y2"
              stroke="#e5e2e1" stroke-width="1"/>
            <text v-for="(grid, i) in gridLines" :key="'gl'+i"
              :x="grid.tx" :y="grid.ty" text-anchor="end" font-size="10" fill="#6B6B6B">{{ grid.label }}</text>
            <text v-for="(pt, i) in xLabels" :key="'xl'+i"
              :x="pt.x" :y="190" text-anchor="middle" font-size="10" fill="#6B6B6B">{{ pt.label }}</text>
            <path :d="expensePath" fill="none" stroke="#C0392B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path :d="incomePath" fill="none" stroke="#2E7D5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle v-for="(pt, i) in expensePoints" :key="'ep'+i"
              :cx="pt.x" :cy="pt.y" r="3" fill="#C0392B"/>
            <circle v-for="(pt, i) in incomePoints" :key="'ip'+i"
              :cx="pt.x" :cy="pt.y" r="3" fill="#2E7D5E"/>
          </svg>
          <view v-else class="chart-empty">
            <text class="empty-text">暂无数据</text>
          </view>
        </view>
        <view class="legend">
          <view class="legend-item">
            <view class="legend-dot" style="background:#C0392B"></view>
            <text class="legend-text">支出</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot" style="background:#2E7D5E"></view>
            <text class="legend-text">收入</text>
          </view>
        </view>
      </view>

      <!-- Ranking Section -->
      <view class="ranking-section">
        <view class="ranking-header">
          <text class="ranking-title">{{ currentType === 1 ? '支出排行' : '收入排行' }}</text>
          <view class="type-toggle">
            <view :class="['toggle-bg', currentType === 2 ? 'right' : '']"></view>
            <view class="toggle-btn" @click="switchType(1)">
              <text :class="['toggle-text', currentType === 1 ? 'white' : '']">支出</text>
            </view>
            <view class="toggle-btn" @click="switchType(2)">
              <text :class="['toggle-text', currentType === 2 ? 'white' : '']">收入</text>
            </view>
          </view>
        </view>

        <view class="ranking-list">
          <block v-if="categoryData.length > 0">
            <view v-for="(item, index) in categoryData" :key="item.id" class="ranking-item">
              <view class="ranking-row">
                <view class="ranking-left">
                  <text class="ranking-icon">📊</text>
                  <text class="ranking-name">{{ item.name }}</text>
                </view>
                <text :class="['ranking-amount', currentType === 1 ? 'red' : 'green']">
                  ¥{{ item.total.toFixed(2) }}
                </text>
              </view>
              <view class="progress-bar">
                <view
                  class="progress-fill"
                  :style="{ width: (item.total / maxCategoryTotal * 100) + '%', background: currentType === 1 ? '#C0392B' : '#2E7D5E' }"
                ></view>
              </view>
            </view>
          </block>
          <view v-else class="ranking-empty">
            <text class="empty-icon">📊</text>
            <text class="empty-text">暂无排行数据</text>
          </view>
        </view>
      </view>

      <view class="quote">
        <text class="quote-text">"平衡并非寻得，而是由你创造。"</text>
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
import { API, TokenStorage } from '../../lib/api.js';

const currentType = ref(1);
const currentMonth = ref(new Date().toISOString().slice(0, 7));
const monthLabel = ref('');
const showPicker = ref(false);
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const currentYear = new Date().getFullYear();
const currentRealMonth = new Date().getMonth() + 1;

const chartData = ref([]);
const categoryData = ref([]);

const yearList = computed(() => {
  const years = [];
  for (let y = currentYear; y >= currentYear - 14; y--) years.push(y);
  return years;
});

const maxCategoryTotal = computed(() => {
  return categoryData.value[0]?.total || 1;
});

// SVG chart computed
const chartWidth = 320;
const chartHeight = 200;
const padding = { top: 20, right: 20, bottom: 30, left: 50 };
const cW = chartWidth - padding.left - padding.right;
const cH = chartHeight - padding.top - padding.bottom;

const maxValue = computed(() => {
  let max = 0;
  chartData.value.forEach(d => {
    if (d.expense > max) max = d.expense;
    if (d.income > max) max = d.income;
  });
  return max === 0 ? 100 : max * 1.2;
});

const gridLines = computed(() => {
  const lines = [];
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const y = padding.top + (i / gridCount) * cH;
    const val = Math.round(maxValue.value * (1 - i / gridCount));
    lines.push({
      x1: padding.left, y1: y, x2: chartWidth - padding.right, y2: y,
      tx: padding.left - 5, ty: y + 4, label: val
    });
  }
  return lines;
});

const xLabels = computed(() => {
  const labels = [];
  if (!chartData.value.length) return labels;
  const interval = Math.ceil(chartData.value.length / 7);
  chartData.value.forEach((d, i) => {
    if (i % interval === 0 || i === chartData.value.length - 1) {
      const x = padding.left + (i / (chartData.value.length - 1)) * cW;
      labels.push({ x, label: d.day });
    }
  });
  return labels;
});

const expensePoints = computed(() => {
  return chartData.value
    .filter(d => d.expense > 0)
    .map((d, i) => {
      const x = padding.left + (i / (chartData.value.length - 1)) * cW;
      const y = padding.top + cH - (d.expense / maxValue.value) * cH;
      return { x, y };
    });
});

const incomePoints = computed(() => {
  return chartData.value
    .filter(d => d.income > 0)
    .map((d, i) => {
      const x = padding.left + (i / (chartData.value.length - 1)) * cW;
      const y = padding.top + cH - (d.income / maxValue.value) * cH;
      return { x, y };
    });
});

const expensePath = computed(() => {
  if (!chartData.value.length) return '';
  return chartData.value.map((d, i) => {
    const x = padding.left + (i / (chartData.value.length - 1)) * cW;
    const y = padding.top + cH - (d.expense / maxValue.value) * cH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
});

const incomePath = computed(() => {
  if (!chartData.value.length) return '';
  return chartData.value.map((d, i) => {
    const x = padding.left + (i / (chartData.value.length - 1)) * cW;
    const y = padding.top + cH - (d.income / maxValue.value) * cH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
});

function togglePicker() {
  showPicker.value = !showPicker.value;
  selectedYear.value = parseInt(currentMonth.value.split('-')[0]);
  selectedMonth.value = parseInt(currentMonth.value.split('-')[1]);
}

function selectYear(year) {
  selectedYear.value = year;
}

function selectMonth(m) {
  selectedMonth.value = m;
  currentMonth.value = `${selectedYear.value}-${String(m).padStart(2, '0')}`;
  updateMonthLabel();
  showPicker.value = false;
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
  const [y, mm] = currentMonth.value.split('-');
  monthLabel.value = `${y}年${parseInt(mm)}月`;
}

async function switchType(type) {
  if (currentType.value === type) return;
  currentType.value = type;
  await loadCategoryData();
}

async function loadData() {
  try {
    const dailyRes = await API.record.getDailyStats(currentMonth.value);
    if (dailyRes.code === 0) {
      chartData.value = dailyRes.data || [];
    }
    await loadCategoryData();
  } catch (e) {
    console.error('加载数据失败', e);
  }
}

async function loadCategoryData() {
  try {
    const statsRes = await API.record.getCategoryStats(currentType.value, currentMonth.value);
    if (statsRes.code === 0) {
      categoryData.value = statsRes.data || [];
    }
  } catch (e) {
    console.error('加载排行数据失败', e);
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
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F0E8;
  font-family: 'Noto Serif SC', serif;
  padding-bottom: 160rpx;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: rgba(245, 240, 232, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.top-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1c1b1b;
  letter-spacing: 0.1em;
}

.main-content {
  padding: 100rpx 48rpx 0;
  max-width: 750rpx;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.month-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow {
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

.arrow-down {
  font-size: 20rpx;
  color: #1c1b1b;
}

.picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-card {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
}

.picker-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1c1b1b;
  text-align: center;
  margin-bottom: 32rpx;
}

.year-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.year-item {
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid #ebe7e6;
  background: #f7f3f2;
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

.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.month-item {
  padding: 20rpx 0;
  text-align: center;
  border-radius: 16rpx;
  background: #f7f3f2;
}

.month-item.disabled {
  opacity: 0.4;
}

.month-text {
  font-size: 28rpx;
  color: #1c1b1b;
}

.month-text.active {
  font-weight: 700;
}

.cancel-btn {
  padding: 16rpx;
  text-align: center;
}

.cancel-text {
  font-size: 28rpx;
  color: #6B6B6B;
}

.chart-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-title {
  font-size: 22rpx;
  color: #6B6B6B;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 32rpx;
}

.chart-wrapper {
  width: 100%;
  height: 400rpx;
}

.line-svg {
  width: 100%;
  height: 100%;
}

.chart-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 28rpx;
  color: #6B6B6B;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 64rpx;
  margin-top: 32rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.legend-dot {
  width: 12rpx;
  height: 6rpx;
  border-radius: 3rpx;
}

.legend-text {
  font-size: 26rpx;
  color: #6B6B6B;
}

.ranking-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 16rpx;
}

.ranking-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1c1b1b;
}

.type-toggle {
  position: relative;
  display: flex;
  width: 288rpx;
  height: 64rpx;
  background: #f7f3f2;
  border-radius: 9999rpx;
  border: 1px solid rgba(116, 120, 120, 0.3);
}

.toggle-bg {
  position: absolute;
  top: 2rpx;
  left: 2rpx;
  width: 138rpx;
  height: 56rpx;
  background: #000;
  border-radius: 9999rpx;
  transition: transform 0.3s;
}

.toggle-bg.right {
  transform: translateX(142rpx);
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.toggle-text {
  font-size: 24rpx;
  color: #6B6B6B;
  font-weight: 500;
}

.toggle-text.white {
  color: #fff;
  font-weight: 700;
}

.ranking-list {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.ranking-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ranking-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ranking-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.ranking-icon {
  font-size: 36rpx;
}

.ranking-name {
  font-size: 32rpx;
  color: #1c1b1b;
  font-weight: 500;
}

.ranking-amount {
  font-size: 36rpx;
  font-weight: 500;
  font-family: 'Hanken Grotesk', sans-serif;
}

.ranking-amount.red { color: #C0392B; }
.ranking-amount.green { color: #2E7D5E; }

.progress-bar {
  height: 6rpx;
  background: #ebe7e6;
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3rpx;
  transition: width 0.3s;
}

.ranking-empty {
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

.quote {
  padding: 64rpx 0 32rpx;
  text-align: center;
}

.quote-text {
  font-size: 26rpx;
  color: #6B6B6B;
  font-style: italic;
  opacity: 0.6;
}

.fab {
  position: fixed;
  bottom: 200rpx;
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
