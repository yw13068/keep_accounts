<template>
  <view class="page" :style="{ backgroundColor: '#F5F0E8', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }">
    <!-- 背景水墨晕染 -->
    <view :style="{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }">
      <view :style="{ position: 'absolute', bottom: '-200rpx', left: '-25%', width: '150%', height: '150%', background: 'radial-gradient(ellipse at center, rgba(212, 204, 188, 0.2) 0%, transparent 70%)' }"></view>
    </view>

    <!-- 主内容区 -->
    <view :style="{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '48rpx', paddingRight: '48rpx', paddingTop: '96rpx', paddingBottom: '96rpx', position: 'relative', zIndex: 10 }">

      <!-- Logo & 品牌 -->
      <view :style="{ textAlign: 'center', marginBottom: '96rpx' }">
        <view :style="{ marginBottom: '48rpx' }">
          <svg :style="{ display: 'block', margin: '0 auto' }" width="192" height="192" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="44" fill="#FAF7F2" stroke="#D4CCBC" stroke-width="1.5"/>
            <circle cx="48" cy="48" r="36" fill="none" stroke="#D4CCBC" stroke-width="0.5" stroke-dasharray="4 4"/>
            <text x="48" y="60" text-anchor="middle" font-family="Noto Serif SC, serif" font-size="40" font-weight="700" fill="#1c1b1b">留</text>
          </svg>
        </view>
        <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '56rpx', fontWeight: '700', color: '#000', display: 'block', marginBottom: '24rpx' }">留白记账</text>
        <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#6B6B6B', fontStyle: 'italic' }">记账，是一种生活的修行。</text>
      </view>

      <!-- 装饰线 -->
      <view :style="{ height: '6rpx', background: 'linear-gradient(90deg, transparent 0%, #D4CCBC 50%, transparent 100%)', borderRadius: '50%', width: '240rpx', marginBottom: '96rpx' }"></view>

      <!-- 品牌理念 -->
      <view :style="{ textAlign: 'center', marginBottom: '128rpx' }">
        <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', color: '#6B6B6B', lineHeight: '1.8', display: 'block' }">
          轻触之间，记录每一笔收支
        </text>
        <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', color: '#6B6B6B', lineHeight: '1.8', display: 'block' }">
          让财务了然于心
        </text>
      </view>

      <!-- CTA 按钮 -->
      <view :style="{ width: '100%', maxWidth: '648rpx', display: 'flex', flexDirection: 'column', gap: '32rpx' }">
        <view @click="goToRegister" :style="{ width: '100%', backgroundColor: '#000', paddingTop: '32rpx', paddingBottom: '32rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16rpx', borderRadius: '16rpx' }">
          <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#fff', letterSpacing: '4rpx', textTransform: 'uppercase' }">开启记账之旅</text>
          <text :style="{ fontSize: '32rpx', color: '#fff' }">→</text>
        </view>
        <view @click="goToLogin" :style="{ width: '100%', paddingTop: '32rpx', paddingBottom: '32rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2rpx solid #000', borderRadius: '16rpx' }">
          <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#000', letterSpacing: '3rpx', textTransform: 'uppercase' }">已有账号？立即登录</text>
        </view>
      </view>

      <!-- 底部品牌 -->
      <view :style="{ marginTop: '128rpx', textAlign: 'center', opacity: 0.3 }">
        <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '20rpx', color: '#6B6B6B', letterSpacing: '4rpx', textTransform: 'uppercase' }">Liubai Finance · 留白记账</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' })
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}
</script>

<style scoped>
.page {
  font-family: 'Noto Serif SC', serif;
}
</style>
