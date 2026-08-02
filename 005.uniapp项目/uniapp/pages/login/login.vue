<template>
  <view class="page">
    <!-- Atmospheric background -->
    <view class="bg-atmosphere">
      <view class="wave wave-1"></view>
      <view class="wave wave-2"></view>
    </view>

    <view class="content">
      <!-- Logo & Branding -->
      <view class="brand-section">
        <view class="logo-wrapper">
          <svg class="logo-svg" viewBox="0 0 128 128" fill="none">
            <circle cx="64" cy="64" r="60" fill="#FAF7F2" stroke="#D4CCBC" stroke-width="2"/>
            <circle cx="64" cy="64" r="52" fill="none" stroke="#D4CCBC" stroke-width="0.5" stroke-dasharray="4 4"/>
            <text x="64" y="76" text-anchor="middle" font-family="serif" font-size="48" font-weight="700" fill="#1c1b1b">留</text>
          </svg>
        </view>
        <text class="title">留白记账</text>
        <text class="subtitle">记账，是一种生活的修行。</text>
      </view>

      <!-- Login Form -->
      <view class="form-section">
        <!-- Phone -->
        <view class="input-group">
          <text class="input-label">手机号</text>
          <input
            class="input-field"
            v-model="phone"
            type="text"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>

        <!-- Password -->
        <view class="input-group">
          <view class="input-header">
            <text class="input-label">密码</text>
            <text class="forgot-link" @click="goForgot">忘记密码？</text>
          </view>
          <input
            class="input-field"
            v-model="password"
            type="password"
            placeholder="请输入密码"
          />
        </view>

        <!-- Remember checkbox -->
        <view class="remember-row">
          <view class="checkbox-wrapper" @click="toggleRemember">
            <view :class="['checkbox', rememberChecked ? 'checked' : '']">
              <text v-if="rememberChecked" class="checkmark">✓</text>
            </view>
            <text class="remember-text">记住登录状态</text>
          </view>
        </view>

        <!-- Login Button -->
        <button class="login-btn" :disabled="loading" @click="handleLogin">
          <text v-if="!loading">登 录</text>
          <text v-else>正在验证...</text>
        </button>
      </view>

      <!-- Register Link -->
      <view class="register-section">
        <view class="divider"></view>
        <view class="register-prompt">
          <text class="register-desc">初识留白？</text>
          <view class="register-btn" @click="goRegister">
            <text class="register-btn-text">注 册 账 号</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { API } from '../../lib/api.js';

const phone = ref('');
const password = ref('');
const rememberChecked = ref(true);
const loading = ref(false);

function toggleRemember() {
  rememberChecked.value = !rememberChecked.value;
}

function goRegister() {
  uni.navigateTo({ url: '/pages/register/register' });
}

function goForgot() {
  uni.navigateTo({ url: '/pages/forgot/forgot' });
}

async function handleLogin() {
  if (!phone.value || !/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    const res = await API.auth.login({
      phone: phone.value,
      password: password.value
    });
    if (res.code === 0) {
      uni.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/home' });
      }, 800);
    } else {
      throw new Error(res.message || '登录失败');
    }
  } catch (err) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' });
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
  position: relative;
  overflow: hidden;
}

.bg-atmosphere {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 300rpx;
  opacity: 0.1;
  pointer-events: none;
}

.wave {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #D4CCBC;
  border-radius: 50% 50% 0 0;
}

.wave-1 {
  opacity: 0.3;
  transform: translateY(20%);
}

.wave-2 {
  opacity: 0.5;
  transform: translateY(35%);
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0 48rpx;
}

.brand-section {
  align-items: center;
  margin-bottom: 80rpx;
}

.logo-wrapper {
  margin-bottom: 32rpx;
}

.logo-svg {
  width: 200rpx;
  height: 200rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  color: #1c1b1b;
  letter-spacing: 0.05em;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #6B6B6B;
  font-style: italic;
}

.form-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.input-label {
  font-size: 22rpx;
  color: #6B6B6B;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8rpx;
}

.input-header .input-label {
  margin-bottom: 0;
}

.forgot-link {
  font-size: 22rpx;
  color: #2B6CB0;
}

.input-field {
  width: 100%;
  border-bottom: 2rpx solid #D4CCBC;
  padding: 16rpx 0;
  font-size: 32rpx;
  color: #1c1b1b;
  background: transparent;
  font-family: 'Noto Serif SC', serif;
}

.input-field:focus {
  border-bottom: 4rpx solid #2B6CB0;
  outline: none;
}

.input-field::placeholder {
  color: #c4c7c7;
}

.remember-row {
  padding: 16rpx 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #747878;
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

.remember-text {
  font-size: 26rpx;
  color: #444748;
}

.login-btn {
  width: 100%;
  height: 112rpx;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 0;
  font-size: 22rpx;
  letter-spacing: 0.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
  font-family: 'Noto Serif SC', serif;
}

.login-btn:active {
  opacity: 0.8;
}

.login-btn[disabled] {
  opacity: 0.6;
}

.register-section {
  width: 100%;
  margin-top: 80rpx;
}

.divider {
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #D4CCBC 50%, transparent 100%);
  margin-bottom: 48rpx;
}

.register-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.register-desc {
  font-size: 26rpx;
  color: #444748;
}

.register-btn {
  padding: 24rpx 64rpx;
  border: 2rpx solid #000;
  display: inline-block;
}

.register-btn-text {
  font-size: 22rpx;
  color: #000;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
</style>
