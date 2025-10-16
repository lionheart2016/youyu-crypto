<template>
  <div class="user-status-container relative" ref="userStatusRef">
    <!-- 未登录状态 - 显示登录按钮 -->
    <div v-if="!isAuthenticated" class="login-button-container">
      <button 
        @click="openLoginModal"
        class="login-button flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span>登录Privy</span>
      </button>
    </div>
    
    <!-- 登录模态框 -->
    <LoginModal 
      :is-open="showLoginModal" 
      @close="closeLoginModal"
      @login-success="handleLoginSuccess"
    />

    <!-- 已登录状态 - 显示用户信息和钱包 -->
    <div v-if="isAuthenticated" class="user-info-container flex items-center space-x-3">
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

      <!-- 用户菜单下拉 -->
      <transition name="dropdown">
        <div v-if="showUserMenu" class="user-dropdown absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
          <!-- 用户基本信息 -->
          <div class="p-4 border-b border-gray-600">
            <div class="flex items-center space-x-3 mb-3">
              <div v-if="userAvatar" class="w-12 h-12 rounded-full overflow-hidden">
                <img :src="userAvatar" :alt="userName" class="w-full h-full object-cover">
              </div>
              <div v-else class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {{ userInitials }}
              </div>
              <div>
                <p class="text-white font-medium">{{ userName }}</p>
                <p class="text-gray-400 text-sm">{{ userEmail }}</p>
              </div>
            </div>
          </div>

          <!-- 钱包信息 -->
          <div class="p-4 border-b border-gray-600">
            <h3 class="text-gray-300 text-sm font-medium mb-2">钱包信息</h3>
            
            <!-- 单个钱包 -->
            <div v-if="wallets.length === 1" class="wallet-item p-3 bg-gray-700 rounded-lg">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-white text-sm font-medium">{{ truncatedWalletAddress(wallets[0].address) }}</p>
                    <p class="text-gray-400 text-xs">{{ wallets[0].chain || 'Ethereum' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white text-sm">{{ wallets[0].balance || '0.00' }} ETH</p>
                  <p class="text-gray-400 text-xs">余额</p>
                </div>
              </div>
            </div>

            <!-- 多个钱包 - 列表形式 -->
            <div v-else-if="wallets.length > 1" class="wallet-list space-y-2">
              <div 
                v-for="(wallet, index) in wallets" 
                :key="index"
                @click="selectWallet(wallet)"
                class="wallet-item p-3 rounded-lg cursor-pointer transition-colors"
                :class="{
                  'bg-blue-900 bg-opacity-30 border border-blue-500': isSelectedWallet(wallet),
                  'bg-gray-700 hover:bg-gray-600': !isSelectedWallet(wallet)
                }"
              >
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-white text-sm font-medium">{{ truncatedWalletAddress(wallet.address) }}</p>
                      <p class="text-gray-400 text-xs">{{ wallet.chain || 'Ethereum' }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-white text-sm">{{ wallet.balance || '0.00' }} ETH</p>
                    <p class="text-gray-400 text-xs">余额</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 无钱包 -->
            <div v-else class="text-center py-4 text-gray-400">
              <p>暂无钱包</p>
            </div>
          </div>

          <!-- 登出按钮 -->
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
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePrivy } from '../contexts/PrivyContext.js'
import LoginModal from './LoginModal.vue'

export default {
  name: 'UserStatus',
  
  components: {
    LoginModal
  },
  
  setup() {
    const privy = usePrivy()
    const showUserMenu = ref(false)
    const showLoginModal = ref(false)
    const userStatusRef = ref(null)
    const selectedWallet = ref(null)
    
    // 计算属性 - 是否已认证
    const isAuthenticated = computed(() => {
      return privy.isAuthenticated.value
    })
    
    // 计算属性 - 用户信息
    const userName = computed(() => {
      if (privy.user.value?.name) return privy.user.value.name
      if (privy.user.value?.email) return privy.user.value.email.split('@')[0]
      return '用户'
    })
    
    const userEmail = computed(() => {
      return privy.user.value?.email || ''
    })
    
    const userAvatar = computed(() => {
      return privy.user.value?.image || null
    })
    
    const userInitials = computed(() => {
      const name = userName.value
      return name.charAt(0).toUpperCase()
    })
    
    // 计算属性 - 钱包信息
    const wallets = computed(() => {
      const walletList = []
      
      // 添加Privy钱包
      if (privy.walletAddress.value) {
        walletList.push({
          address: privy.walletAddress.value,
          balance: privy.walletBalance.value || '0.00',
          chain: 'Ethereum',
          type: 'privy'
        })
      }
      
      // 如果需要支持更多钱包，可以在这里添加
      // 例如：从其他状态管理中获取钱包信息
      
      return walletList
    })
    
    // 计算属性 - 当前选中的钱包
    const currentWallet = computed(() => {
      if (selectedWallet.value) {
        return selectedWallet.value
      }
      return wallets.value.length > 0 ? wallets.value[0] : null
    })
    
    // 方法 - 处理登录点击
    const openLoginModal = () => {
      showLoginModal.value = true
    }
    
    const closeLoginModal = () => {
      showLoginModal.value = false
    }
    
    const handleLoginSuccess = () => {
      console.log('登录成功')
      closeLoginModal()
    }
    
    // 方法 - 切换用户菜单
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }
    
    // 方法 - 截断钱包地址
    const truncatedWalletAddress = (address) => {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    
    // 方法 - 选择钱包
    const selectWallet = (wallet) => {
      selectedWallet.value = wallet
      // 可以在这里添加钱包切换的逻辑
    }
    
    // 方法 - 判断是否为选中的钱包
    const isSelectedWallet = (wallet) => {
      if (!currentWallet.value) return false
      return wallet.address === currentWallet.value.address
    }
    
    // 方法 - 处理登出
    const handleLogout = async () => {
      try {
        showUserMenu.value = false
        await privy.logout()
        console.log('登出成功')
      } catch (error) {
        console.error('登出失败:', error)
      }
    }
    
    // 点击外部关闭菜单
    const handleClickOutside = (event) => {
      if (userStatusRef.value && !userStatusRef.value.contains(event.target)) {
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
      showLoginModal,
      userStatusRef,
      selectedWallet,
      
      // 计算属性
      isAuthenticated,
      userName,
      userEmail,
      userAvatar,
      userInitials,
      wallets,
      currentWallet,
      
      // 方法
      openLoginModal,
      closeLoginModal,
      handleLoginSuccess,
      toggleUserMenu,
      truncatedWalletAddress,
      selectWallet,
      isSelectedWallet,
      handleLogout
    }
  }
}
</script>

<style scoped>
/* 登录按钮样式 */
.login-button-container {
  display: flex;
  align-items: center;
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-button:hover {
  transform: translateY(-1px);
}

.login-button svg {
  transition: transform 0.2s ease;
}

.login-button:hover svg {
  transform: scale(1.1);
}

/* 用户菜单样式 */
.user-status-container {
  position: relative;
}

.user-avatar {
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
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

/* 钱包项目样式 */
.wallet-item {
  transition: all 0.2s ease;
}

.wallet-item:hover {
  transform: translateY(-1px);
}

/* 登出按钮悬停效果 */
.user-dropdown button:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-dropdown {
    width: 280px;
    right: -10px;
  }
}
</style>