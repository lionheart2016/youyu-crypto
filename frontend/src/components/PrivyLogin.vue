<template>
  <div class="privy-login">
    <!-- 登录按钮 -->
    <button 
      @click="loginWithPrivy" 
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
import { ref } from 'vue'
import { usePrivy } from '../contexts/PrivyContext.js'

export default {
  name: 'PrivyLogin',
  
  setup() {
    // 使用组合式API获取Privy上下文
    const privy = usePrivy()
    const loading = ref(false)
    
    // 直接调用Privy登录
    const loginWithPrivy = async () => {
      try {
        loading.value = true
        console.log('开始Privy登录...')
        
        // 检查privy对象是否存在
        if (!privy) {
          throw new Error('Privy上下文未初始化')
        }
        
        console.log('Privy上下文对象:', privy)
        console.log('Privy上下文状态 - ready:', privy.ready?.value)
        console.log('Privy上下文状态 - showIframe:', privy.showIframe?.value)
        
        // 调用Privy登录方法 - 使用正确的方法名login
        const result = await privy.login()
        
        loading.value = false
        
        console.log('Privy登录成功:', result)
        return result
      } catch (error) {
        loading.value = false
        console.error('Privy登录失败:', error)
        alert(`登录失败: ${error.message}`)
        throw error
      }
    }
    
    return {
      loading,
      loginWithPrivy
    }
  }
}
</script>

<style scoped>
.privy-login {
  display: inline-block;
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