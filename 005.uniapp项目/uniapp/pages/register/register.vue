<template>
  <view class="page">
    <!-- Top Nav -->
    <view class="nav-bar">
      <view class="nav-btn" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">注册账号</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="content">
      <!-- Brand Quote -->
      <view class="quote-section">
        <text class="quote">"始于落笔，成于静心。"</text>
      </view>

      <!-- Form -->
      <view class="form-section">
        <!-- Phone -->
        <view class="input-group">
          <text class="input-label">手机号</text>
          <view class="input-row">
            <text class="input-icon">📱</text>
            <input
              class="input-field"
              v-model="phone"
              type="text"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>
        </view>

        <!-- Username -->
        <view class="input-group">
          <text class="input-label">用户名 / 笔名</text>
          <view class="input-row">
            <text class="input-icon">👤</text>
            <input
              class="input-field"
              v-model="username"
              type="text"
              placeholder="请输入您的称呼"
              maxlength="20"
            />
          </view>
        </view>

        <!-- Password -->
        <view class="input-group">
          <text class="input-label">密码</text>
          <view class="input-row">
            <text class="input-icon">🔒</text>
            <input
              class="input-field"
              v-model="password"
              :type="showPwd ? 'text' : 'password'"
              placeholder="请输入密码"
            />
            <view class="toggle-btn" @click="showPwd = !showPwd">
              <text>{{ showPwd ? '🙈' : '👁' }}</text>
            </view>
          </view>
        </view>

        <!-- Confirm Password -->
        <view class="input-group">
          <text class="input-label">确认密码</text>
          <view class="input-row">
            <text class="input-icon">✓</text>
            <input
              class="input-field"
              v-model="confirmPwd"
              type="password"
              placeholder="请再次输入密码"
            />
          </view>
        </view>

        <!-- Agreement -->
        <view class="agreement-row">
          <view class="checkbox-wrapper" @click="agreeTerms = !agreeTerms">
            <view :class="['checkbox', agreeTerms ? 'checked' : '']">
              <text v-if="agreeTerms" class="checkmark">✓</text>
            </view>
          </view>
          <text class="agreement-text">
            我已阅读并同意
            <text class="link">《服务协议》</text> 与
            <text class="link">《隐私政策》</text>
          </text>
        </view>

        <!-- Submit Button -->
        <button class="submit-btn" :disabled="loading" @click="handleRegister">
          <text v-if="!loading">开启记账之旅</text>
          <text v-else>注册中...</text>
        </button>
      </view>

      <!-- Login Link -->
      <view class="login-section">
        <text class="login-text">已有账号？</text>
        <text class="login-link" @click="goLogin">立即登录</text>
      </view>

      <view class="footer-mark">
        <text class="footer-text">Liubai Finance · 留白记账</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { API } from '../../lib/api.js';

const phone = ref('');
const username = ref('');
const password = ref('');
const confirmPwd = ref('');
const agreeTerms = ref(false);
const showPwd = ref(false);
const loading = ref(false);

function goBack() {
  uni.navigateBack();
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' });
}

async function handleRegister() {
  if (!phone.value || !/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  if (!username.value || username.value.length < 4 || username.value.length > 20) {
    uni.showToast({ title: '用户名长度4-20位', icon: 'none' });
    return;
  }
  if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(password.value)) {
    uni.showToast({ title: '密码须8-20位且包含字母和数字', icon: 'none' });
    return;
  }
  if (password.value !== confirmPwd.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' });
    return;
  }
  if (!agreeTerms.value) {
    uni.showToast({ title: '请阅读并同意协议', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    const res = await API.auth.register({
      phone: phone.value,
      username: username.value,
      password: password.value
    });
    if (res.code === 0) {
      uni.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/home' });
      }, 800);
    } else {
      throw new Error(res.message || '注册失败');
    }
  } catch (err) {
    uni.showToast({ title: err.message || '注册失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F0E8;
  font-family: 'Noto Serif SC', serif;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: rgba(245, 240, 232, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  z-index: 100;
}

.nav-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  font-size: 36rpx;
  color: #1c1b1b;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1c1b1b;
  letter-spacing: 0.2em;
}

.nav-placeholder {
  width: 80rpx;
}

.content {
  padding: 120rpx 48rpx 32rpx;
  max-width: 750rpx;
  margin: 0 auto;
}

.quote-section {
  text-align: center;
  margin-bottom: 48rpx;
}

.quote {
  font-size: 32rpx;
  color: #6B6B6B;
  font-style: italic;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 22rpx;
  color: #6B6B6B;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12rpx;
}

.input-row {
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #D4CCBC;
  padding-bottom: 16rpx;
}

.input-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  color: #D4CCBC;
}

.input-field {
  flex: 1;
  font-size: 32rpx;
  color: #1c1b1b;
  background: transparent;
  font-family: 'Noto Serif SC', serif;
}

.input-field::placeholder {
  color: #c4c7c7;
}

.toggle-btn {
  padding: 8rpx;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 16rpx 0;
}

.checkbox-wrapper {
  margin-top: 4rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #D4CCBC;
  border-radius: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.checkbox.checked {
  background: #000;
  border-color: #000;
}

.checkmark {
  color: #fff;
  font-size: 22rpx;
}

.agreement-text {
  font-size: 26rpx;
  color: #6B6B6B;
  line-height: 1.6;
  flex: 1;
}

.link {
  color: #1c1b1b;
  text-decoration: underline;
  text-decoration-color: #D4CCBC;
}

.submit-btn {
  height: 112rpx;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
  font-family: 'Noto Serif SC', serif;
}

.submit-btn:active {
  background: #313030;
}

.submit-btn[disabled] {
  opacity: 0.6;
}

.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 48rpx;
}

.login-text {
  font-size: 26rpx;
  color: #6B6B6B;
}

.login-link {
  font-size: 26rpx;
  color: #1c1b1b;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #C0392B;
  text-underline-offset: 6rpx;
}

.footer-mark {
  display: flex;
  justify-content: center;
  margin-top: 32rpx;
}

.footer-text {
  font-size: 20rpx;
  color: #747878;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.4;
}
</style>
