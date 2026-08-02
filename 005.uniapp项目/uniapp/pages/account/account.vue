<template>
  <view class="page" :style="{ backgroundColor: '#F5F0E8', minHeight: '100vh', paddingBottom: '160rpx' }">
    <!-- Top AppBar -->
    <view class="header" :style="{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'rgba(245, 240, 232, 0.8)', backdropFilter: 'blur(12px)', height: '128rpx', borderBottom: '1rpx solid rgba(212, 204, 188, 0.3)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '16rpx' }">
      <view @click="goBack" :style="{ position: 'absolute', left: '48rpx', bottom: '24rpx', width: '80rpx', height: '80rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }">
        <text :style="{ fontSize: '40rpx', color: '#000' }">←</text>
      </view>
      <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', fontWeight: '700', color: '#000', letterSpacing: '2rpx' }">账本管理</text>
    </view>

    <view :style="{ paddingTop: '160rpx', paddingLeft: '48rpx', paddingRight: '48rpx' }">
      <!-- 品牌头图 -->
      <view :style="{ width: '100%', height: '384rpx', borderRadius: '24rpx', overflow: 'hidden', position: 'relative', marginBottom: '48rpx', boxShadow: '0 8rpx 40rpx rgba(26, 26, 26, 0.05)' }">
        <image :src="'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80'" :style="{ width: '100%', height: '100%', objectFit: 'cover' }" mode="aspectFill"></image>
        <view :style="{ position: 'absolute', bottom: '32rpx', left: '48rpx' }">
          <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#6B6B6B', fontStyle: 'italic' }">笔墨之间，收支有道</text>
        </view>
      </view>

      <!-- 支出分类 -->
      <view :style="{ marginBottom: '80rpx' }">
        <view :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48rpx' }">
          <view :style="{ display: 'flex', alignItems: 'center', gap: '16rpx' }">
            <view :style="{ width: '4rpx', height: '48rpx', backgroundColor: '#C0392B', borderRadius: '4rpx' }"></view>
            <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', fontWeight: '600', color: '#000' }">支出分类</text>
          </view>
          <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#6B6B6B' }">共 {{ expenseCategories.length }} 个分类</text>
        </view>

        <view :style="{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32rpx' }">
          <view v-for="cat in expenseCategories" :key="cat.id" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16rpx', position: 'relative' }">
            <view :style="{ position: 'relative' }">
              <view @click="flashEffect($event)" :style="{ width: '112rpx', height: '112rpx', borderRadius: '50%', backgroundColor: 'rgba(212, 204, 188, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2rpx solid transparent', transition: 'all 0.3s' }">
                <text :style="{ fontSize: '48rpx' }">{{ getIconEmoji(cat.icon) }}</text>
              </view>
              <view @click="deleteCategory('expense', cat.id)" :style="{ position: 'absolute', top: '-8rpx', right: '-8rpx', width: '40rpx', height: '40rpx', backgroundColor: '#C0392B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4rpx 12rpx rgba(0,0,0,0.15)' }">
                <text :style="{ fontSize: '24rpx', color: '#fff' }">✕</text>
              </view>
            </view>
            <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#1c1b1b' }">{{ cat.name }}</text>
          </view>

          <!-- 新增按钮 -->
          <view @click="openAddModal('expense')" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16rpx', cursor: 'pointer' }">
            <view :style="{ width: '112rpx', height: '112rpx', borderRadius: '50%', border: '4rpx dashed #D4CCBC', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
              <text :style="{ fontSize: '48rpx', color: '#6B6B6B' }">+</text>
            </view>
            <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#6B6B6B' }">新增</text>
          </view>
        </view>
      </view>

      <!-- 分割线 -->
      <view :style="{ height: '4rpx', background: 'linear-gradient(90deg, transparent 0%, #D4CCBC 20%, #D4CCBC 80%, transparent 100%)', margin: '48rpx 0' }"></view>

      <!-- 收入分类 -->
      <view :style="{ marginBottom: '48rpx' }">
        <view :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48rpx' }">
          <view :style="{ display: 'flex', alignItems: 'center', gap: '16rpx' }">
            <view :style="{ width: '4rpx', height: '48rpx', backgroundColor: '#2E7D5E', borderRadius: '4rpx' }"></view>
            <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', fontWeight: '600', color: '#000' }">收入分类</text>
          </view>
          <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#6B6B6B' }">共 {{ incomeCategories.length }} 个分类</text>
        </view>

        <view :style="{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32rpx' }">
          <view v-for="cat in incomeCategories" :key="cat.id" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16rpx', position: 'relative' }">
            <view :style="{ position: 'relative' }">
              <view @click="flashEffect($event)" :style="{ width: '112rpx', height: '112rpx', borderRadius: '50%', backgroundColor: 'rgba(212, 204, 188, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2rpx solid transparent', transition: 'all 0.3s' }">
                <text :style="{ fontSize: '48rpx' }">{{ getIconEmoji(cat.icon) }}</text>
              </view>
              <view @click="deleteCategory('income', cat.id)" :style="{ position: 'absolute', top: '-8rpx', right: '-8rpx', width: '40rpx', height: '40rpx', backgroundColor: '#C0392B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4rpx 12rpx rgba(0,0,0,0.15)' }">
                <text :style="{ fontSize: '24rpx', color: '#fff' }">✕</text>
              </view>
            </view>
            <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#1c1b1b' }">{{ cat.name }}</text>
          </view>

          <!-- 新增按钮 -->
          <view @click="openAddModal('income')" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16rpx', cursor: 'pointer' }">
            <view :style="{ width: '112rpx', height: '112rpx', borderRadius: '50%', border: '4rpx dashed #D4CCBC', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
              <text :style="{ fontSize: '48rpx', color: '#6B6B6B' }">+</text>
            </view>
            <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#6B6B6B' }">新增</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 新增分类弹窗 -->
    <view v-if="showModal" @click="closeModal" :style="{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4rpx)', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
      <view @click.stop :style="{ backgroundColor: '#ffffff', borderRadius: '24rpx', padding: '48rpx', width: '640rpx', boxShadow: '0 20rpx 60rpx rgba(0, 0, 0, 0.15)' }">
        <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', fontWeight: '600', color: '#000', display: 'block', marginBottom: '32rpx' }">{{ modalTitle }}</text>

        <!-- 分类名称输入 -->
        <view :style="{ marginBottom: '32rpx' }">
          <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#6B6B6B', letterSpacing: '2rpx', textTransform: 'uppercase', display: 'block', marginBottom: '16rpx' }">分类名称</text>
          <input v-model="newCategoryName" :style="{ width: '100%', backgroundColor: 'transparent', borderBottom: '4rpx solid #D4CCBC', paddingTop: '16rpx', paddingBottom: '16rpx', paddingLeft: '0', paddingRight: '0', fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', color: '#000', outline: 'none' }" placeholder="请输入分类名称" />
        </view>

        <!-- 图标选择 -->
        <view :style="{ marginBottom: '32rpx' }">
          <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#6B6B6B', letterSpacing: '2rpx', textTransform: 'uppercase', display: 'block', marginBottom: '16rpx' }">选择图标</text>
          <view :style="{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16rpx', maxHeight: '320rpx', overflowY: 'auto' }">
            <view v-for="icon in ICONS" :key="icon" @click="selectIcon(icon)" :style="{ width: '80rpx', height: '80rpx', borderRadius: '16rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: selectedIcon === icon ? '#e7e2da' : 'transparent', border: selectedIcon === icon ? '4rpx solid #000' : '2rpx solid transparent' }">
              <text :style="{ fontSize: '40rpx' }">{{ getIconEmoji(icon) }}</text>
            </view>
          </view>
        </view>

        <!-- 按钮 -->
        <view :style="{ display: 'flex', gap: '24rpx' }">
          <view @click="closeAddModal" :style="{ flex: 1, paddingTop: '24rpx', paddingBottom: '24rpx', border: '2rpx solid #000', borderRadius: '16rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
            <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#000', letterSpacing: '2rpx', textTransform: 'uppercase' }">取消</text>
          </view>
          <view @click="confirmAddCategory" :style="{ flex: 1, paddingTop: '24rpx', paddingBottom: '24rpx', backgroundColor: '#000', borderRadius: '16rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
            <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#fff', letterSpacing: '2rpx', textTransform: 'uppercase' }">确认</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Bottom TabBar -->
    <view :style="{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, backgroundColor: '#ffffff', height: '128rpx', borderTop: '1rpx solid rgba(212, 204, 188, 0.3)', boxShadow: '0 -4rpx 10rpx rgba(26, 26, 26, 0.05)', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }">
      <view @click="switchTab('home')" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16rpx 32rpx' }">
        <text :style="{ fontSize: '48rpx' }">🏠</text>
        <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#6B6B6B', marginTop: '8rpx', letterSpacing: '1rpx', textTransform: 'uppercase' }">首页</text>
      </view>
      <view @click="switchTab('stats')" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16rpx 32rpx' }">
        <text :style="{ fontSize: '48rpx' }">📊</text>
        <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#6B6B6B', marginTop: '8rpx', letterSpacing: '1rpx', textTransform: 'uppercase' }">统计</text>
      </view>
      <view @click="switchTab('budget')" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16rpx 32rpx' }">
        <text :style="{ fontSize: '48rpx' }">📅</text>
        <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#6B6B6B', marginTop: '8rpx', letterSpacing: '1rpx', textTransform: 'uppercase' }">预算</text>
      </view>
      <view @click="switchTab('profile')" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16rpx 32rpx' }">
        <text :style="{ fontSize: '48rpx' }">👤</text>
        <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#1c1b1b', marginTop: '8rpx', letterSpacing: '1rpx', textTransform: 'uppercase' }">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

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

// 预设图标库
const ICONS = ['restaurant', 'directions_bus', 'shopping_bag', 'home', 'movie', 'health_and_safety', 'school', 'pets', 'flight', 'fitness_center', 'spa', 'music_note', 'book', 'coffee', 'local_bar', 'sports_esports', 'attach_money', 'savings', 'card_giftcard', 'redeem', 'trending_up', 'account_balance_wallet', 'payments', 'work', 'business_center', 'local_atm']

// 支出分类
const expenseCategories = ref([
  { id: 1, name: '餐饮', icon: 'restaurant' },
  { id: 2, name: '交通', icon: 'directions_bus' },
  { id: 3, name: '购物', icon: 'shopping_bag' },
  { id: 4, name: '居住', icon: 'home' },
  { id: 5, name: '娱乐', icon: 'movie' },
  { id: 6, name: '医疗', icon: 'health_and_safety' },
  { id: 7, name: '教育', icon: 'school' },
  { id: 8, name: '人情', icon: 'favorite' },
])

// 收入分类
const incomeCategories = ref([
  { id: 101, name: '工资', icon: 'payments' },
  { id: 102, name: '奖金', icon: 'redeem' },
  { id: 103, name: '理财', icon: 'trending_up' },
  { id: 104, name: '兼职', icon: 'account_balance_wallet' },
])

const showModal = ref(false)
const modalTitle = ref('新增分类')
const newCategoryName = ref('')
const selectedIcon = ref('restaurant')
const currentType = ref('expense')
let nextExpenseId = 9
let nextIncomeId = 105

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// Tab 切换
const switchTab = (tab) => {
  const routes = {
    home: '/pages/index/index',
    stats: '/pages/stats/stats',
    budget: '/pages/budget/budget',
    profile: '/pages/profile/profile'
  }
  uni.switchTab({ url: routes[tab] })
}

// 闪烁效果
const flashEffect = (event) => {
  // UniApp 中实现闪烁效果
}

// 删除分类
const deleteCategory = (type, id) => {
  if (type === 'expense') {
    expenseCategories.value = expenseCategories.value.filter(c => c.id !== id)
  } else {
    incomeCategories.value = incomeCategories.value.filter(c => c.id !== id)
  }
}

// 打开新增弹窗
const openAddModal = (type) => {
  currentType.value = type
  selectedIcon.value = ICONS[0]
  newCategoryName.value = ''
  modalTitle.value = type === 'expense' ? '新增支出分类' : '新增收入分类'
  showModal.value = true
}

// 选择图标
const selectIcon = (icon) => {
  selectedIcon.value = icon
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

const closeAddModal = () => {
  showModal.value = false
}

// 确认新增
const confirmAddCategory = () => {
  const name = newCategoryName.value.trim()

  if (!name) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' })
    return
  }

  // 检查是否重复
  const allNames = [...expenseCategories.value.map(c => c.name), ...incomeCategories.value.map(c => c.name)]
  if (allNames.includes(name)) {
    uni.showToast({ title: '该分类已存在，请使用其他名称', icon: 'none' })
    return
  }

  if (currentType.value === 'expense') {
    expenseCategories.value.push({ id: nextExpenseId++, name, icon: selectedIcon.value })
  } else {
    incomeCategories.value.push({ id: nextIncomeId++, name, icon: selectedIcon.value })
  }

  closeAddModal()
}
</script>

<style scoped>
.page {
  font-family: 'Noto Serif SC', serif;
}
</style>
