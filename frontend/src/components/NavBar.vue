<template>
  <nav class="glass-effect border-b border-gray-700 relative z-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-8">
          <div class="flex items-center space-x-3">
            <h1 class="text-2xl font-bold gradient-text">YouyuCrypto</h1>
          </div>
          <div class="hidden md:flex space-x-6">
            <router-link 
              to="/" 
              class="text-gray-300 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              仪表板
            </router-link>
            <router-link 
              to="/trading" 
              class="text-gray-300 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              交易
            </router-link>
            <router-link 
              to="/wallet" 
              class="text-gray-300 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              钱包
            </router-link>
            <router-link 
              to="/test-sync" 
              class="text-gray-300 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              同步测试
            </router-link>
            <router-link 
              to="/create-wallet" 
              class="text-gray-300 hover:text-white transition-colors"
              active-class="text-white font-semibold"
            >
              创建钱包
            </router-link>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- 使用新的用户状态组件 -->
          <UserStatus />
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import UserStatus from './UserStatus.vue'
import { usePrivy } from '../contexts/PrivyContext.js'
import walletStore from '../store/walletStore'

export default {
  name: 'NavBar',
  components: {
    UserStatus
  },
  
  setup() {
    const privy = usePrivy()
    
    return {
      privy
    }
  }
}
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>