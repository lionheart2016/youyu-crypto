<template>
  <div class="wallet-status-container relative" ref="walletStatusRef">
    <!-- 未连接状态 - 显示连接钱包按钮 -->
    <div v-if="!walletConnected" class="connect-wallet-container">
      <button 
        @click="connectWallet"
        class="connect-wallet-button flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span>连接钱包</span>
      </button>
    </div>

    <!-- 已连接状态 - 显示钱包信息 -->
    <div v-else class="wallet-info-container flex items-center space-x-3">
      <!-- 钱包图标 -->
      <div 
        @click="toggleWalletMenu" 
        class="wallet-icon cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-blue-500">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>

      <!-- 钱包菜单下拉 -->
      <transition name="dropdown">
        <div v-if="showWalletMenu" class="wallet-dropdown absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
          <!-- 钱包基本信息 -->
          <div class="p-4 border-b border-gray-600">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p class="text-white font-medium">以太坊钱包</p>
                <p class="text-gray-400 text-sm">{{ truncatedWalletAddress(walletAddress) }}</p>
              </div>
            </div>
          </div>

          <!-- 钱包详情 -->
          <div class="p-4 border-b border-gray-600">
            <h3 class="text-gray-300 text-sm font-medium mb-2">钱包详情</h3>
            
            <div class="wallet-details space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-400">余额</span>
                <span class="text-white">{{ walletBalance || '0.00' }} ETH</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">网络</span>
                <span class="text-white">Ethereum</span>
              </div>
            </div>
          </div>

          <!-- 断开连接按钮 -->
          <div class="p-2">
            <button 
              @click="disconnectWallet" 
              class="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path>
              </svg>
              <span>断开连接</span>
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

export default {
  name: 'WalletStatus',
  
  setup() {
    const privy = usePrivy()
    const showWalletMenu = ref(false)
    const walletStatusRef = ref(null)
    
    // 计算属性 - 钱包连接状态
    const walletConnected = computed(() => {
      return privy.walletAddress.value && privy.walletAddress.value.length > 0
    })
    
    // 计算属性 - 钱包地址
    const walletAddress = computed(() => {
      return privy.walletAddress.value || ''
    })
    
    // 计算属性 - 钱包余额
    const walletBalance = computed(() => {
      return privy.walletBalance.value || '0.00'
    })
    
    // 方法 - 连接钱包
    const connectWallet = () => {
      privy.login('wallet')
    }
    
    // 方法 - 断开钱包连接
    const disconnectWallet = async () => {
      try {
        showWalletMenu.value = false
        await privy.logout()
        console.log('钱包已断开连接')
      } catch (error) {
        console.error('断开钱包连接失败:', error)
      }
    }
    
    // 方法 - 切换钱包菜单
    const toggleWalletMenu = () => {
      showWalletMenu.value = !showWalletMenu.value
    }
    
    // 方法 - 截断钱包地址
    const truncatedWalletAddress = (address) => {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    
    // 点击外部关闭菜单
    const handleClickOutside = (event) => {
      if (walletStatusRef.value && !walletStatusRef.value.contains(event.target)) {
        showWalletMenu.value = false
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
      showWalletMenu,
      walletStatusRef,
      
      // 计算属性
      walletConnected,
      walletAddress,
      walletBalance,
      
      // 方法
      connectWallet,
      disconnectWallet,
      toggleWalletMenu,
      truncatedWalletAddress
    }
  }
}
</script>

<style scoped>
/* 连接钱包按钮样式 */
.connect-wallet-container {
  display: flex;
  align-items: center;
}

.connect-wallet-button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.2s ease;
}

.connect-wallet-button:hover {
  transform: translateY(-1px);
}

.connect-wallet-button svg {
  transition: transform 0.2s ease;
}

.connect-wallet-button:hover svg {
  transform: scale(1.1);
}

/* 钱包状态容器 */
.wallet-status-container {
  position: relative;
}

.wallet-icon {
  transition: all 0.3s ease;
}

.wallet-icon:hover {
  transform: scale(1.05);
}

/* 钱包下拉菜单 */
.wallet-dropdown {
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

/* 钱包详情样式 */
.wallet-details {
  font-size: 14px;
}

/* 断开连接按钮悬停效果 */
.wallet-dropdown button:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wallet-dropdown {
    width: 280px;
    right: -10px;
  }
}
</style>