<template>
  <div class="wallet-connect">
    <!-- 未连接状态 -->
    <div v-if="!isConnected" class="wallet-options">
      <div class="flex space-x-3">
        <!-- MetaMask 连接按钮 -->
        <button
          @click="connectMetaMask"
          class="bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-700 transition-all duration-200 flex items-center"
        >
          <svg class="w-4 h-4 mr-2" viewBox="0 0 32 32" fill="currentColor">
            <path d="M27.5 2l-9.5 9.5 9.5 9.5 2.5-2.5-7-7 7-7z"/>
            <path d="M13.5 12l-9.5 9.5 9.5 9.5 2.5-2.5-7-7 7-7z"/>
          </svg>
          MetaMask
        </button>
        
        <!-- Privy 登录组件 -->
        <PrivyLogin @loginSuccess="handlePrivyLoginSuccess" />
      </div>
    </div>
    
    <!-- 已连接状态 -->
    <div v-else class="wallet-connected">
      <div class="flex items-center space-x-3">
        <div class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          已连接
        </div>
        <div class="text-gray-300 text-sm">
          {{ truncatedAddress }}
        </div>
        <div class="text-gray-300 text-sm">
          {{ balance }} ETH
        </div>
        <div v-if="walletType === 'privy'" class="text-blue-400 text-xs bg-blue-900 px-2 py-1 rounded">
          Privy
        </div>
        <div v-else class="text-orange-400 text-xs bg-orange-900 px-2 py-1 rounded">
          MetaMask
        </div>
        <button
          @click="disconnectWallet"
          class="text-red-400 hover:text-red-300 text-sm"
        >
          断开
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers'
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
    return { privy }
  },
  
  data() {
    return {
      isConnected: false,
      account: null,
      balance: '0.00',
      provider: null,
      signer: null,
      unsubscribe: null,
      walletType: null // 'metamask' 或 'privy'
    }
  },
  
  created() {
    // 从全局状态初始化
    this.updateFromStore()
    
    // 订阅状态变化
    this.unsubscribe = walletStore.subscribe((state) => {
      this.isConnected = state.isConnected
      this.account = state.account
      this.balance = state.balance
      this.provider = state.provider
      this.signer = state.signer
      this.walletType = state.walletType
    })
  },
  
  beforeUnmount() {
    // 清理订阅
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  
  computed: {
    truncatedAddress() {
      if (!this.account) return ''
      return `${this.account.slice(0, 6)}...${this.account.slice(-4)}`
    }
  },
  
  async mounted() {
    await this.checkConnection()
  },
  
  methods: {
    updateFromStore() {
      const state = walletStore.getState()
      this.isConnected = state.isConnected
      this.account = state.account
      this.balance = state.balance
      this.provider = state.provider
      this.signer = state.signer
      this.walletType = state.walletType
    },
    
    // 连接MetaMask
    async connectMetaMask() {
      try {
        if (typeof window.ethereum !== 'undefined') {
          // 请求账户连接
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          })
          
          // 创建provider和signer
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          
          // 获取余额
          const balance = await provider.getBalance(accounts[0])
          const formattedBalance = ethers.formatEther(balance).substring(0, 6)
          
          // 更新全局状态
          walletStore.setState({
            isConnected: true,
            account: accounts[0],
            balance: formattedBalance,
            provider: provider,
            signer: signer,
            walletType: 'metamask'
          })
          
          // 监听账户变化
          window.ethereum.on('accountsChanged', this.handleAccountsChanged)
          
          console.log('MetaMask钱包连接成功:', accounts[0])
        } else {
          alert('请安装MetaMask钱包')
        }
      } catch (error) {
        console.error('连接MetaMask钱包失败:', error)
        alert('连接MetaMask钱包失败，请重试')
      }
    },
    
    // 连接Privy
    async connectPrivy() {
      try {
        console.log('开始连接Privy钱包...')
        
        // 检查Privy是否已初始化
        if (!this.privy.ready) {
          throw new Error('Privy客户端未初始化，请稍后重试')
        }
        
        // 使用Privy上下文连接
        const user = await this.privy.login('wallet')
        
        // 更新全局状态
        walletStore.setState({
          isConnected: true,
          account: this.privy.walletAddress,
          balance: this.privy.walletBalance,
          provider: null, // Privy有自己的provider
          signer: null,
          walletType: 'privy'
        })
        
        console.log('Privy钱包连接成功:', this.privy.walletAddress)
        console.log('用户信息:', user)
      } catch (error) {
        console.error('连接Privy钱包失败:', error)
        alert('连接Privy钱包失败: ' + error.message)
      }
    },
    
    async checkConnection() {
      // 首先检查全局状态，如果已经手动断开连接，则不自动重连
      const currentState = walletStore.getState()
      if (currentState.isConnected === false) {
        // 如果全局状态显示已断开，则不自动重连
        return
      }
      
      // 检查MetaMask连接
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        })
        
        if (accounts.length > 0) {
          // 创建provider和signer
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          
          // 获取余额
          const balance = await provider.getBalance(accounts[0])
          const formattedBalance = ethers.formatEther(balance).substring(0, 6)
          
          // 更新全局状态
          walletStore.setState({
            isConnected: true,
            account: accounts[0],
            balance: formattedBalance,
            provider: provider,
            signer: signer,
            walletType: 'metamask'
          })
          
          window.ethereum.on('accountsChanged', this.handleAccountsChanged)
        }
      }
      
      // 检查Privy连接状态
      if (this.privy.authenticated) {
        walletStore.setState({
          isConnected: true,
          account: this.privy.walletAddress,
          balance: this.privy.walletBalance,
          provider: null,
          signer: null,
          walletType: 'privy'
        })
      }
    },
    
    async getBalance() {
      const state = walletStore.getState()
      if (state.account && state.provider) {
        try {
          // 调用后端API获取以太坊余额
          const response = await fetch(`/api/trading/ethereum/balance/${state.account}`)
          if (response.ok) {
            const balanceData = await response.json()
            const formattedBalance = balanceData.ethBalance
            
            // 更新全局状态中的余额
            walletStore.setState({
              balance: formattedBalance,
              tokenBalances: balanceData.tokenBalances
            })
          } else {
            throw new Error('获取余额失败')
          }
        } catch (error) {
          console.error('获取余额失败:', error)
          // 如果后端API失败，使用本地provider获取余额
          const balance = await state.provider.getBalance(state.account)
          const formattedBalance = ethers.formatEther(balance).substring(0, 6)
          
          // 更新全局状态中的余额
          walletStore.setState({
            balance: formattedBalance
          })
        }
      }
    },
    
    handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        // 账户断开，更新全局状态
        walletStore.disconnect()
      } else {
        // 账户切换，更新全局状态
        walletStore.setState({
          account: accounts[0]
        })
        this.getBalance()
      }
    },
    
    // 处理Privy登录成功
    handlePrivyLoginSuccess(user) {
      console.log('Privy登录成功回调:', user)
      
      // 更新全局状态
      walletStore.setState({
        isConnected: true,
        account: this.privy.walletAddress,
        balance: this.privy.walletBalance,
        provider: null,
        signer: null,
        walletType: 'privy'
      })
      
      console.log('Privy钱包连接成功:', this.privy.walletAddress)
    },
    
    async disconnectWallet() {
      // 确认断开连接
      const confirmed = confirm('确定要断开钱包连接吗？')
      if (!confirmed) {
        return
      }
      
      try {
        if (this.walletType === 'metamask') {
          // 断开MetaMask连接
          if (window.ethereum && window.ethereum.disconnect) {
            await window.ethereum.disconnect()
          }
          
          // 移除事件监听器
          if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
          }
        } else if (this.walletType === 'privy') {
          // 断开Privy连接
          await this.privy.disconnectWallet()
        }
        
        // 使用全局状态管理断开连接
        walletStore.disconnect()
        
        console.log('钱包已断开连接')
        
        // 可选：发送断开事件到其他组件
        this.$emit('walletDisconnected')
        
      } catch (error) {
        console.error('断开钱包连接失败:', error)
        // 即使断开失败，也使用全局状态管理断开连接
        walletStore.disconnect()
        
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
        }
      }
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