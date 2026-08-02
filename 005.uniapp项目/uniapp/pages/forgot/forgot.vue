<template>
  <view class="page" :style="{ backgroundColor: '#F5F0E8', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Serif SC', serif' }">

    <!-- Top Nav -->
    <view :style="{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'rgba(245, 240, 232, 0.8)', backdropFilter: 'blur(12px)', height: '112rpx', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '16rpx' }">
      <view @click="goBack" :style="{ position: 'absolute', left: '32rpx', bottom: '16rpx', width: '80rpx', height: '80rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
        <text :style="{ fontSize: '40rpx', color: '#000' }">←</text>
      </view>
      <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', fontWeight: '700', color: '#000', letterSpacing: '4rpx' }">找回密码</text>
    </view>

    <!-- Main Content -->
    <view :style="{ maxWidth: '750rpx', margin: '0 auto', paddingLeft: '48rpx', paddingRight: '48rpx', paddingTop: '192rpx', paddingBottom: '64rpx', flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }">

      <!-- 步骤1：验证手机号 & 重置密码 -->
      <view v-if="step === 1" :style="{ width: '100%', display: 'flex', flexDirection: 'column', gap: '48rpx' }">
        <view :style="{ textAlign: 'center' }">
          <view :style="{ width: '160rpx', height: '160rpx', backgroundColor: '#e7e2da', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32rpx' }">
            <text :style="{ fontSize: '96rpx' }">🔑</text>
          </view>
          <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', color: '#6B6B6B', lineHeight: '1.8', display: 'block' }">请输入您注册的手机号</text>
          <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', color: '#6B6B6B', lineHeight: '1.8', display: 'block' }">我们将为您发送验证码</text>
        </view>

        <view :style="{ display: 'flex', flexDirection: 'column', gap: '40rpx' }">
          <!-- 手机号 -->
          <view :style="{ position: 'relative' }">
            <text :style="{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', fontSize: '40rpx', color: '#6B6B6B' }">📱</text>
            <input v-model="phone" :style="{ width: '100%', backgroundColor: 'transparent', borderBottom: '4rpx solid #D4CCBC', paddingTop: '32rpx', paddingBottom: '32rpx', paddingLeft: '64rpx', paddingRight: '0', fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', color: '#000', outline: 'none' }" placeholder="请输入手机号" type="tel" maxlength="11" />
          </view>

          <!-- 验证码 -->
          <view :style="{ position: 'relative' }">
            <text :style="{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', fontSize: '40rpx', color: '#6B6B6B' }">💬</text>
            <input v-model="verifyCode" :style="{ width: '100%', backgroundColor: 'transparent', borderBottom: '4rpx solid #D4CCBC', paddingTop: '32rpx', paddingBottom: '32rpx', paddingLeft: '64rpx', paddingRight: '192rpx', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '32rpx', fontWeight: '500', color: '#000', outline: 'none', letterSpacing: '4rpx' }" placeholder="请输入验证码" type="text" maxlength="6" />
            <view @click="sendCode" :style="{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#2B6CB0', letterSpacing: '2rpx', textTransform: 'uppercase' }">
              <text v-if="countdown === 0" :style="{ color: '#2B6CB0' }">发送验证码</text>
              <text v-else :style="{ color: '#6B6B6B' }">{{ countdown }}s</text>
            </view>
          </view>

          <!-- 新密码 -->
          <view :style="{ position: 'relative' }">
            <text :style="{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', fontSize: '40rpx', color: '#6B6B6B' }">🔒</text>
            <input v-model="newPwd" :style="{ width: '100%', backgroundColor: 'transparent', borderBottom: '4rpx solid #D4CCBC', paddingTop: '32rpx', paddingBottom: '32rpx', paddingLeft: '64rpx', paddingRight: '80rpx', fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', color: '#000', outline: 'none' }" placeholder="请输入新密码（8-20位）" :password="!showNewPwd" />
            <view @click="togglePwd('new')" :style="{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', fontSize: '40rpx', color: '#6B6B6B' }">
              <text v-if="showNewPwd">👁</text>
              <text v-else>👁</text>
            </view>
          </view>

          <!-- 确认新密码 -->
          <view :style="{ position: 'relative' }">
            <text :style="{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', fontSize: '40rpx', color: '#6B6B6B' }">✓</text>
            <input v-model="confirmPwd" :style="{ width: '100%', backgroundColor: 'transparent', borderBottom: '4rpx solid #D4CCBC', paddingTop: '32rpx', paddingBottom: '32rpx', paddingLeft: '64rpx', paddingRight: '80rpx', fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', color: '#000', outline: 'none' }" placeholder="请再次输入新密码" :password="!showConfirmPwd" />
            <view @click="togglePwd('confirm')" :style="{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', fontSize: '40rpx', color: '#6B6B6B' }">
              <text v-if="showConfirmPwd">👁</text>
              <text v-else>👁</text>
            </view>
          </view>
        </view>

        <view @click="resetPassword" :style="{ width: '100%', backgroundColor: '#000', paddingTop: '32rpx', paddingBottom: '32rpx', borderRadius: '16rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '32rpx' }">
          <text v-if="!loading" :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#fff', letterSpacing: '4rpx', textTransform: 'uppercase' }">重置</text>
          <text v-else :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#fff', letterSpacing: '4rpx' }">处理中...</text>
        </view>
      </view>

      <!-- 步骤2：完成 -->
      <view v-if="step === 2" :style="{ width: '100%', display: 'flex', flexDirection: 'column', gap: '48rpx' }">
        <view :style="{ textAlign: 'center', paddingTop: '64rpx' }">
          <view :style="{ width: '160rpx', height: '160rpx', backgroundColor: 'rgba(46, 125, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32rpx' }">
            <text :style="{ fontSize: '96rpx' }">✓</text>
          </view>
          <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '32rpx', fontWeight: '600', color: '#000', display: 'block', marginBottom: '16rpx' }">密码重置成功</text>
          <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#6B6B6B', display: 'block' }">请使用新密码登录您的账号</text>
        </view>

        <view @click="goToLogin" :style="{ width: '100%', backgroundColor: '#000', paddingTop: '32rpx', paddingBottom: '32rpx', borderRadius: '16rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '64rpx' }">
          <text :style="{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '22rpx', fontWeight: '700', color: '#fff', letterSpacing: '4rpx', textTransform: 'uppercase' }">返回登录</text>
        </view>
      </view>
    </view>

    <!-- 底部引言 -->
    <view :style="{ paddingTop: '64rpx', paddingBottom: '64rpx', textAlign: 'center' }">
      <text :style="{ fontFamily: "'Noto Serif SC', serif", fontSize: '26rpx', color: '#6B6B6B', fontStyle: 'italic', opacity: 0.6 }">"见微知著，静心记账"</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { API } from '../../lib/api.js'

const phone = ref('')
const verifyCode = ref('')
const newPwd = ref('')
const confirmPwd = ref('')
const countdown = ref(0)
const step = ref(1)
const loading = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)

let timer = null

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳转到登录
const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

// 切换密码可见性
const togglePwd = (type) => {
  if (type === 'new') {
    showNewPwd.value = !showNewPwd.value
  } else {
    showConfirmPwd.value = !showConfirmPwd.value
  }
}

// 发送验证码
const sendCode = () => {
  const phoneVal = phone.value.trim()
  if (!phoneVal || phoneVal.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  // 开始倒计时
  countdown.value = 60

  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      countdown.value = 0
    }
  }, 1000)

  uni.showToast({ title: `验证码已发送至 ${phoneVal.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`, icon: 'none' })
}

// 重置密码
const resetPassword = async () => {
  const phoneVal = phone.value.trim()
  const code = verifyCode.value.trim()
  const newPwdVal = newPwd.value
  const confirmPwdVal = confirmPwd.value

  if (!phoneVal || phoneVal.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!code || code.length < 4) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  if (!newPwdVal || newPwdVal.length < 8 || newPwdVal.length > 20) {
    uni.showToast({ title: '密码长度需为8-20位', icon: 'none' })
    return
  }
  if (!/\d/.test(newPwdVal) || !/[a-zA-Z]/.test(newPwdVal)) {
    uni.showToast({ title: '密码须包含字母和数字', icon: 'none' })
    return
  }
  if (newPwdVal !== confirmPwdVal) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }

  // 停止倒计时
  if (timer) clearInterval(timer)

  loading.value = true

  try {
    await API.auth.resetPassword({
      phone: phoneVal,
      code: code,
      password: newPwdVal
    })

    step.value = 2
  } catch (error) {
    uni.showToast({ title: error.message || '重置失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  font-family: 'Noto Serif SC', serif;
}
</style>
