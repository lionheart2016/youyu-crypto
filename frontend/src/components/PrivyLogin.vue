<template>
  <div class="privy-login">
    
    <!-- 登录模态框 -->
    <div v-if="showLoginModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">登录到 Youyu Crypto</h3>
          <button @click="closeModal" class="close-button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="login-options">
          <!-- 钱包登录 -->
          <div class="login-option">
            <button 
              @click="loginWithWallet" 
              class="login-button wallet-button"
              :disabled="loading"
            >
              <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <path d="M12 8v8m-4-4h8" stroke="white" stroke-width="2"/>
              </svg>
              钱包登录
            </button>
            <p class="option-description">使用嵌入式钱包或外部钱包</p>
          </div>
          
          <!-- 邮箱登录 -->
          <div class="login-option">
            <button 
              @click="showEmailLogin" 
              class="login-button email-button"
              :disabled="loading"
            >
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              邮箱登录
            </button>
            <p class="option-description">通过邮箱验证码登录</p>
          </div>
          
          <!-- 社交登录 -->
          <div class="login-option">
            <div class="social-buttons">
              <button 
                @click="loginWithGoogle" 
                class="social-button google-button"
                :disabled="loading"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              
              <button 
                @click="loginWithApple" 
                class="social-button apple-button"
                :disabled="loading"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
              
              <button 
                @click="loginWithDiscord" 
                class="social-button discord-button"
                :disabled="loading"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.942 5.556a16.299 16.299 0 00-4.126-1.297c-.178.321-.385.754-.529 1.097a15.175 15.175 0 00-4.573 0c-.144-.343-.35-.776-.527-1.097a16.274 16.274 0 00-4.129 1.3c-2.611 3.946-3.319 7.794-2.965 11.587a16.494 16.494 0 005.061 2.593 12.65 12.65 0 001.088-1.755 10.689 10.689 0 01-1.707-.831c.143-.106.283-.217.418-.331 3.291 1.539 6.866 1.539 10.118 0 .137.114.277.225.418.331-.541.326-1.114.606-1.71.832a12.52 12.52 0 001.088 1.755 16.46 16.46 0 005.064-2.595c.415-4.396-.709-8.209-2.973-11.589zM8.678 14.813c-.988 0-1.798-.922-1.798-2.045s.793-2.047 1.798-2.047 1.801.925 1.798 2.047c.001 1.123-.793 2.045-1.798 2.045zm6.644 0c-.988 0-1.798-.922-1.798-2.045s.793-2.047 1.798-2.047 1.801.925 1.798 2.047c0 1.123-.793 2.045-1.798 2.045z"/>
                </svg>
                Discord
              </button>
            </div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>正在登录...</p>
        </div>
      </div>
    </div>
    
    <!-- 邮箱登录模态框 -->
    <div v-if="showEmailLoginModal" class="modal-overlay" @click="closeEmailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">邮箱登录</h3>
          <button @click="closeEmailModal" class="close-button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="email-login-form">
          <div class="form-group">
            <label for="email" class="form-label">邮箱地址</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="请输入您的邮箱地址"
              class="form-input"
              :disabled="emailSent"
            >
          </div>
          
          <div v-if="emailSent" class="form-group">
            <label for="verificationCode" class="form-label">验证码</label>
            <div class="verification-input-group">
              <input 
                type="text" 
                id="verificationCode" 
                v-model="verificationCode" 
                placeholder="请输入6位验证码"
                class="form-input verification-input"
                maxlength="6"
              >
              <button 
                @click="resendVerificationCode" 
                class="resend-button"
                :disabled="resendDisabled"
              >
                {{ resendCountdown > 0 ? `${resendCountdown}秒后重发` : '重发验证码' }}
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              v-if="!emailSent" 
              @click="sendVerificationCode" 
              class="submit-button"
              :disabled="!email || loading"
            >
              发送验证码
            </button>
            <button 
              v-else 
              @click="verifyEmailCode" 
              class="submit-button"
              :disabled="!verificationCode || loading"
            >
              登录
            </button>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>{{ emailSent ? '正在验证...' : '正在发送...' }}</p>
        </div>
      </div>
    </div>
    
    <!-- 登录按钮 -->
    <button 
      @click="openLoginModal" 
      class="privy-login-button"
    >
      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
      Privy登录
    </button>
  </div>
</template>

<script>
import { usePrivy } from '../contexts/PrivyContext.js'

export default {
  name: 'PrivyLogin',
  
  setup() {
    const privy = usePrivy()
    return { privy }
  },
  
  data() {
    return {
      showLoginModal: false,
      showGoogleLogin: false,
      showEmailLoginModal: false,
      loading: false,
      email: '',
      verificationCode: '',
      emailSent: false,
      resendCountdown: 0,
      errorMessage: ''
    }
  },
  
  computed: {
    resendDisabled() {
      return this.resendCountdown > 0;
    }
  },
  
  methods: {
    openLoginModal() {
      this.showLoginModal = true
    },
    
    closeModal() {
      if (!this.loading) {
        this.showLoginModal = false
      }
    },
    
    async loginWithWallet() {
      await this.handleLogin('wallet')
    },
    
    showEmailLogin() {
      this.showEmailLoginModal = true;
      this.resetEmailForm();
    },
    
    closeEmailModal() {
      if (!this.loading) {
        this.showEmailLoginModal = false;
        this.resetEmailForm();
      }
    },
    
    resetEmailForm() {
      this.email = '';
      this.verificationCode = '';
      this.emailSent = false;
      this.resendCountdown = 0;
      this.errorMessage = '';
    },
    
    async sendVerificationCode() {
      try {
        this.loading = true;
        this.errorMessage = '';
        
        // 调用Privy发送验证码
        await this.privy.sendEmailVerificationCode(this.email);
        
        this.emailSent = true;
        this.startResendCountdown();
        console.log('验证码发送成功');
      } catch (error) {
        this.errorMessage = error.message;
        console.error('发送验证码失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async verifyEmailCode() {
      try {
        this.loading = true;
        this.errorMessage = '';
        
        // 调用Privy邮箱登录处理
        const user = await this.privy.handleEmailLogin(this.email, this.verificationCode);
        
        // 登录成功，关闭模态框
        this.showEmailLoginModal = false;
        this.loading = false;
        this.resetEmailForm();
        
        // 触发登录成功事件
        this.$emit('loginSuccess', user);
        
        console.log('邮箱登录成功:', user);
      } catch (error) {
        this.errorMessage = error.message;
        console.error('邮箱登录失败:', error);
        this.loading = false;
      }
    },
    
    async resendVerificationCode() {
      if (this.resendDisabled) return;
      
      await this.sendVerificationCode();
    },
    
    startResendCountdown() {
      this.resendCountdown = 60; // 60秒倒计时
      
      const countdownInterval = setInterval(() => {
        this.resendCountdown--;
        
        if (this.resendCountdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    },
    
    async loginWithGoogle() {
      await this.handleLogin('google')
    },
    
    async loginWithApple() {
      await this.handleLogin('apple')
    },
    
    async loginWithDiscord() {
      await this.handleLogin('discord')
    },
    
    async handleLogin(method) {
      try {
        this.loading = true
        console.log(`开始${method}登录...`)
        
        // 调用Privy登录方法
        const user = await this.privy.login(method)
        
        // 登录成功，关闭模态框
        this.showLoginModal = false
        this.loading = false
        
        // 触发登录成功事件
        this.$emit('loginSuccess', user)
        
        console.log(`${method}登录成功:`, user)
      } catch (error) {
        this.loading = false
        console.error(`${method}登录失败:`, error)
        alert(`登录失败: ${error.message}`)
      }
    }
  }
}
</script>

<style scoped>
.privy-login {
  display: inline-block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
}

.login-options {
  padding: 24px;
}

.login-option {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.wallet-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: translateY(-1px);
}

.email-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.email-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

.option-description {
  font-size: 12px;
  color: #6b7280;
  margin: 8px 0 0 0;
  text-align: center;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.social-button {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.social-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.google-button:hover:not(:disabled) {
  border-color: #ea4335;
  color: #ea4335;
}

.apple-button:hover:not(:disabled) {
  border-color: #000000;
  color: #000000;
}

.discord-button:hover:not(:disabled) {
  border-color: #5865f2;
  color: #5865f2;
}

/* 邮箱登录表单样式 */
.email-login-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.verification-input-group {
  display: flex;
  gap: 8px;
}

.verification-input {
  flex: 1;
}

.resend-button {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.resend-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.resend-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 24px;
}

.submit-button {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 14px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.privy-login-button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.privy-login-button:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: translateY(-1px);
}
</style>