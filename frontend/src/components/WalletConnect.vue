<template>
  <div class="wallet-connect">
    <!-- 未连接状态 -->
    <div v-if="!privy.isAuthenticated" class="wallet-options">
      <!-- Privy 登录组件 -->
      <PrivyLogin @loginSuccess="handlePrivyLoginSuccess" />
    </div>
    
    <!-- 已连接状态 - Privy -->
    <div v-else-if="privy.isAuthenticated" class="wallet-connected">
      <div class="flex items-center space-x-4">
        <!-- 用户头像 -->
        <div v-if="privy.user?.image" class="w-8 h-8 rounded-full overflow-hidden">
          <img :src="privy.user.image" :alt="privy.user.name || '用户'" class="w-full h-full object-cover">
        </div>
        <div v-else class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {{ userInitials }}
        </div>
        
        <!-- 用户信息 -->
        <div class="flex flex-col">
          <span class="text-white text-sm font-medium">{{ privy.user?.name || privy.user?.email || '用户' }}</span>
          <span class="text-gray-400 text-xs">{{ truncatedPrivyAddress }}</span>
        </div>
        
        <!-- 钱包余额 -->
        <div class="text-gray-300 text-sm">
          {{ privy.walletBalance }} ETH
        </div>
        
        <!-- Privy标识 -->
        <div class="text-blue-400 text-xs bg-blue-900 px-2 py-1 rounded">
          Privy
        </div>
        
        <!-- 登出按钮 -->
        <button
          @click="logoutPrivy"
          class="text-red-400 hover:text-red-300 text-sm"
        >
          登出
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import walletStore from '../store/walletStore'
import { usePrivy } from '../contexts/PrivyContext.js'
import PrivyLogin from './PrivyLogin.vue'

export default {
  name: 'WalletConnect',
  
  components: {
    PrivyLogin
  },
  
  setup() {
    const privy = usePrivy()
    
    // 响应式状态
    const isConnected = ref(false)
    const account = ref(null)
    const balance = ref('0.00')
    let unsubscribe = null
    
    // 计算属性
    const truncatedPrivyAddress = computed(() => {
      if (!privy.walletAddress.value) return ''
      return `${privy.walletAddress.value.slice(0, 6)}...${privy.walletAddress.value.slice(-4)}`
    })
    
    const userInitials = computed(() => {
      if (!privy.user.value) return 'U'
      const name = privy.user.value.name || privy.user.value.email || '用户'
      return name.charAt(0).toUpperCase()
    })
    
    // 从全局状态更新
    const updateFromStore = () => {
      const state = walletStore.getState()
      isConnected.value = state.isConnected
      account.value = state.account
      balance.value = state.balance
    }
    
    // Privy登录成功处理
    const handlePrivyLoginSuccess = (user) => {
      console.log('Privy登录成功:', user)
      // 登录成功后，Privy上下文会自动更新认证状态
    }
    
    // Privy登出
    const logoutPrivy = async () => {
      try {
        await privy.logout()
        console.log('Privy登出成功')
      } catch (error) {
        console.error('Privy登出失败:', error)
        alert('登出失败: ' + error.message)
      }
    }
    
    // 检查连接状态
    const checkConnection = async () => {
      // 检查Privy连接状态
      if (privy.isAuthenticated.value) {
        walletStore.setState({
          isConnected: true,
          account: privy.walletAddress.value,
          balance: privy.walletBalance.value,
          provider: null,
          signer: null,
          walletType: 'privy'
        })
      }
    }
    
    // 组件挂载时的初始化
    onMounted(async () => {
      // 从全局状态初始化
      updateFromStore()
      
      // 订阅状态变化
      unsubscribe = walletStore.subscribe((state) => {
        isConnected.value = state.isConnected
        account.value = state.account
        balance.value = state.balance
      })
      
      // 检查连接状态
      await checkConnection()
    })
    
    // 组件卸载时的清理
    onUnmounted(() => {
      // 清理订阅
      if (unsubscribe) {
        unsubscribe()
      }
    })
    
    // 监听Privy认证状态变化
    watch(() => privy.isAuthenticated.value, (newVal) => {
      console.log('Privy认证状态变化:', newVal)
      if (newVal) {
        // 认证成功，更新全局状态
        walletStore.setState({
          isConnected: true,
          account: privy.walletAddress.value,
          balance: privy.walletBalance.value,
          provider: null,
          signer: null,
          walletType: 'privy'
        })
      } else {
        // 认证失败或登出，重置状态
        walletStore.setState({
          isConnected: false,
          account: null,
          balance: '0.00',
          provider: null,
          signer: null,
          walletType: null
        })
      }
    })
    
    // 返回模板中使用的变量和方法
    return {
      // 状态
      isConnected,
      account,
      balance,
      privy,
      
      // 计算属性
      truncatedPrivyAddress,
      userInitials,
      
      // 方法
      logoutPrivy,
      handlePrivyLoginSuccess
    }
  }
}
</script>

<style scoped>
.wallet-connect {
  min-width: 200px;
}

.wallet-options {
  display: flex;
  justify-content: center;
}
</style>