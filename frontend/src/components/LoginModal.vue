<template>
  <div v-if="isOpen" class="login-modal-overlay" @click="closeModal">
    <div class="login-modal" @click.stop>
      <div class="modal-header">
        <h2>选择登录方式</h2>
        <button @click="closeModal" class="close-button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="login-options">
        <!-- Google登录 -->
        <button @click="handleGoogleLogin" class="login-option google">
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>使用 Google 登录</span>
        </button>
        
        <!-- Apple登录 -->
        <button @click="handleAppleLogin" class="login-option apple">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 12.28c-.06-.36-.17-.7-.31-1.03.13-.03.26-.05.38-.08.85-.2 1.55-.7 2.09-1.5.54-.8.81-1.72.81-2.75 0-1.06-.3-2.02-.9-2.87-.6-.85-1.44-1.43-2.51-1.74-.34-.1-.68-.15-1.03-.15-.5 0-.98.09-1.45.26-.47.17-.9.41-1.29.72-.39.31-.72.68-.99 1.11-.27.43-.46.9-.57 1.4-.11.5-.14 1.01-.09 1.53.05.52.18 1.02.39 1.5.21.48.49.92.84 1.32.35.4.75.74 1.2 1.02.45.28.93.47 1.44.58.51.11 1.03.14 1.56.09.53-.05 1.03-.18 1.5-.39.48-.21.92-.49 1.32-.84.4-.35.74-.75 1.02-1.2.28-.45.47-.93.58-1.44.11-.51.14-1.03.09-1.56zM12 2c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-1.5 4.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/>
          </svg>
          <span>使用 Apple 登录</span>
        </button>
        
        <!-- GitHub登录 -->
        <button @click="handleGitHubLogin" class="login-option github">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>使用 GitHub 登录</span>
        </button>
        
        <!-- 邮箱登录 -->
        <button @click="showEmailLogin" class="login-option email">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <span>使用邮箱登录</span>
        </button>
        
        <!-- 钱包登录 -->
        <button @click="handleWalletLogin" class="login-option wallet">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          <span>连接钱包</span>
        </button>
      </div>
      
      <!-- 邮箱登录表单 -->
      <div v-if="showEmailForm" class="email-login-form">
        <h3>邮箱登录</h3>
        <form @submit.prevent="handleEmailLogin">
          <div class="form-group">
            <label for="email">邮箱地址</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              placeholder="请输入邮箱地址"
              required
            >
          </div>
          <div class="form-actions">
            <button type="button" @click="cancelEmailLogin" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '发送中...' : '发送验证码' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { usePrivy } from '../contexts/PrivyContext.js'

export default {
  name: 'LoginModal',
  
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close', 'login-success'],
  
  setup(props, { emit }) {
    const privy = usePrivy()
    const loading = ref(false)
    const showEmailForm = ref(false)
    const email = ref('')
    
    // 关闭模态框
    const closeModal = () => {
      emit('close')
      showEmailForm.value = false
      email.value = ''
    }
    
    // Google登录
    const handleGoogleLogin = async () => {
      try {
        loading.value = true
        await privy.handleGoogleLogin()
        emit('login-success')
        closeModal()
      } catch (error) {
        console.error('Google登录失败:', error)
        alert(`Google登录失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // Apple登录
    const handleAppleLogin = async () => {
      try {
        loading.value = true
        await privy.handleAppleLogin()
        emit('login-success')
        closeModal()
      } catch (error) {
        console.error('Apple登录失败:', error)
        alert(`Apple登录失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // GitHub登录
    const handleGitHubLogin = async () => {
      try {
        loading.value = true
        await privy.handleGitHubLogin()
        emit('login-success')
        closeModal()
      } catch (error) {
        console.error('GitHub登录失败:', error)
        alert(`GitHub登录失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // 显示邮箱登录表单
    const showEmailLogin = () => {
      showEmailForm.value = true
    }
    
    // 取消邮箱登录
    const cancelEmailLogin = () => {
      showEmailForm.value = false
      email.value = ''
    }
    
    // 邮箱登录
    const handleEmailLogin = async () => {
      if (!email.value) {
        alert('请输入邮箱地址')
        return
      }
      
      try {
        loading.value = true
        await privy.sendEmailVerificationCode(email.value)
        alert('验证码已发送到您的邮箱')
        // 这里可以添加验证码输入的逻辑
        closeModal()
      } catch (error) {
        console.error('邮箱登录失败:', error)
        alert(`邮箱登录失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    // 钱包登录
    const handleWalletLogin = async () => {
      try {
        loading.value = true
        await privy.login()
        emit('login-success')
        closeModal()
      } catch (error) {
        console.error('钱包登录失败:', error)
        alert(`钱包登录失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    return {
      loading,
      showEmailForm,
      email,
      closeModal,
      handleGoogleLogin,
      handleAppleLogin,
      handleGitHubLogin,
      showEmailLogin,
      cancelEmailLogin,
      handleEmailLogin,
      handleWalletLogin
    }
  }
}
</script>

<style scoped>
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-modal {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #374151;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #374151;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.login-option:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-option.google:hover {
  border-color: #4285F4;
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
}

.login-option.apple:hover {
  ��order-color: #000000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.login-option.github:hover {
  border-color: #333333;
  box-shadow: 0 4px 12px rgba(51, 51, 51, 0.2);
}

.login-option.email:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.login-option.wallet:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.email-login-form {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid #374151;
}

.email-login-form h3 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #d1d5db;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #374151;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 640px) {
  .login-modal {
    margin: 16px;
    width: calc(100% - 32px);
  }
}
</style>