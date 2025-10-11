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
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- 用户信息和登出菜单 -->
          <div class="user-menu-container relative" ref="userMenuRef">
            <!-- 已连接状态显示 -->
            <div v-if="isConnected || privy.isAuthenticated" class="flex items-center space-x-3">
              <!-- 用户头像 -->
              <div 
                @click="toggleUserMenu" 
                class="user-avatar cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div v-if="userAvatar" class="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500">
                  <img :src="userAvatar" :alt="userName" class="w-full h-full object-cover">
                </div>
                <div v-else class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-blue-500">
                  {{ userInitials }}
                </div>
              </div>
              
              <!-- 连接状态指示器 -->
              <div class="connection-status">
                <div class="status-dot" :class="connectionClass"></div>
                <span class="text-xs text-gray-300">{{ connectionText }}</span>
              </div>
              
              <!-- 用户菜单下拉 -->
              <transition name="dropdown">
                <div v-if="showUserMenu" class="user-dropdown absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
                  <div class="p-4 border-b border-gray-600">
                    <div class="flex items-center space-x-3 mb-2">
                      <div v-if="userAvatar" class="w-10 h-10 rounded-full overflow-hidden">
                        <img :src="userAvatar" :alt="userName" class="w-full h-full object-cover">
                      </div>
                      <div v-else class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {{ userInitials }}
                      </div>
                      <div>
                        <p class="text-white font-medium text-sm">{{ userName }}</p>
                        <p class="text-gray-400 text-xs">{{ truncatedAddress }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 text-xs">
                      <span class="px-2 py-1 rounded" :class="walletTypeClass">{{ walletTypeText }}</span>
                      <span class="text-gray-400">•</span>
                      <span class="text-gray-300">{{ walletBalance }} ETH</span>
                    </div>
                  </div>
                  
                  <div class="p-2">
                    <button 
                      @click="handleLogout" 
                      class="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded transition-colors"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path>
                      </svg>
                      <span>登出</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
            
            <!-- 未连接状态 -->
            <div v-else>
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WalletConnect from './WalletConnect.vue'
import { usePrivy } from '../contexts/PrivyContext.js'
import walletStore from '../store/walletStore'

export default {
  name: 'NavBar',
  components: {
    WalletConnect
  },
  
  setup() {
    const privy = usePrivy()
    const showUserMenu = ref(false)
    const userMenuRef = ref(null)
    
    // 计算属性 - 连接状态
    const isConnected = computed(() => {
      const state = walletStore.getState()
      return state.isConnected || privy.isAuthenticated.value
    })
    
    // 计算属性 - 用户信息
    const userName = computed(() => {
      if (privy.user.value?.name) return privy.user.value.name
      if (privy.user.value?.email) return privy.user.value.email.split('@')[0]
      return '用户'
    })
    
    const userAvatar = computed(() => {
      return privy.user.value?.image || null
    })
    
    const userInitials = computed(() => {
      const name = userName.value
      return name.charAt(0).toUpperCase()
    })
    
    // 计算属性 - 钱包地址
    const truncatedAddress = computed(() => {
      const address = privy.walletAddress.value || walletStore.getState().account
      if (!address) return '无地址'
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    })
    
    // 计算属性 - 钱包余额
    const walletBalance = computed(() => {
      return privy.walletBalance.value || walletStore.getState().balance || '0.00'
    })
    
    // 计算属性 - 钱包类型
    const walletTypeText = computed(() => {
      if (privy.isAuthenticated.value) return 'Privy'
      return '未知'
    })
    
    const walletTypeClass = computed(() => {
      if (privy.isAuthenticated.value) return 'bg-blue-900 text-blue-400'
      return 'bg-orange-900 text-orange-400'
    })
    
    // 计算属性 - 连接状态指示器
    const connectionText = computed(() => {
      return privy.isAuthenticated.value ? '已认证' : '已连接'
    })
    
    const connectionClass = computed(() => {
      return privy.isAuthenticated.value ? 'bg-green-500' : 'bg-blue-500'
    })
    
    // 方法 - 切换用户菜单
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }
    
    // 方法 - 处理登出
    const handleLogout = async () => {
      try {
        showUserMenu.value = false
        
        // 使用Privy登出
        if (privy.isAuthenticated.value) {
          await privy.logout()
          console.log('Privy登出成功')
        }
      } catch (error) {
        console.error('登出失败:', error)
      }
    }
    
    // 点击外部关闭菜单
    const handleClickOutside = (event) => {
      if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
        showUserMenu.value = false
      }
    }
    
    // 生命周期
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      // 状态
      showUserMenu,
      userMenuRef,
      privy,
      
      // 计算属性
      isConnected,
      userName,
      userAvatar,
      userInitials,
      truncatedAddress,
      walletBalance,
      walletTypeText,
      walletTypeClass,
      connectionText,
      connectionClass,
      
      // 方法
      toggleUserMenu,
      handleLogout
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

/* 用户菜单样式 */
.user-menu-container {
  position: relative;
}

.user-avatar {
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

/* 连接状态指示器 */
.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 用户下拉菜单 */
.user-dropdown {
  backdrop-filter: blur(10px);
  background: rgba(31, 41, 55, 0.95);
  animation: dropdownFade 0.2s ease-out;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下拉菜单过渡效果 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 登出按钮悬停效果 */
.user-dropdown button:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* 钱包类型标签 */
.user-dropdown span.rounded {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-dropdown {
    width: 280px;
    right: -10px;
  }
  
  .connection-status {
    display: none;
  }
}
</style>