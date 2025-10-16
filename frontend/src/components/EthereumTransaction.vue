<template>
  <div class="ethereum-transaction">
    <div class="transaction-header">
      <h3>以太坊交易</h3>
      <div class="wallet-status" v-if="walletConnected">
        <span class="connected">钱包已连接</span>
        <span class="account-info">{{ currentAccount ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}` : '' }}</span>
      </div>
    </div>

    <div class="transaction-form" v-if="walletConnected">
      <div class="form-group">
        <label>交易类型</label>
        <select v-model="transactionType" class="form-select">
          <option value="eth">ETH 转账</option>
          <option value="token">代币转账</option>
        </select>
      </div>

      <div class="form-group">
        <label>收款地址</label>
        <input 
          v-model="toAddress" 
          type="text" 
          placeholder="0x..."
          class="form-input"
          :class="{ 'error': addressError }"
        >
        <div v-if="addressError" class="error-message">{{ addressError }}</div>
      </div>

      <div class="form-group" v-if="transactionType === 'token'">
        <label>代币选择</label>
        <select v-model="selectedToken" class="form-select">
          <option value="USDT">USDT</option>
          <option value="USDC">USDC</option>
          <option value="DAI">DAI</option>
        </select>
      </div>

      <div class="form-group">
        <label>金额</label>
        <input 
          v-model="amount" 
          type="number" 
          placeholder="0.00"
          class="form-input"
          :class="{ 'error': amountError }"
        >
        <div v-if="amountError" class="error-message">{{ amountError }}</div>
      </div>

      <div class="gas-estimation" v-if="gasEstimation">
        <div class="gas-info">
          <span>预估Gas费用:</span>
          <span>{{ gasEstimation.totalCost }} ETH</span>
        </div>
        <div class="gas-details">
          <span>Gas Limit: {{ gasEstimation.gasLimit }}</span>
          <span>Gas Price: {{ gasEstimation.gasPrice }} wei</span>
        </div>
      </div>

      <button 
        @click="estimateGas" 
        class="btn btn-secondary"
        :disabled="!isFormValid || isEstimating"
      >
        {{ isEstimating ? '估算中...' : '估算Gas费用' }}
      </button>

      <button 
        @click="sendTransaction" 
        class="btn btn-primary"
        :disabled="!isFormValid || isSending || !gasEstimation"
      >
        {{ isSending ? '发送中...' : '发送交易' }}
      </button>

      <div v-if="transactionResult" class="transaction-result">
        <div class="success-message">交易提交成功!</div>
        <div class="tx-hash">
          <span>交易哈希:</span>
          <a :href="`https://etherscan.io/tx/${transactionResult.transactionHash}`" target="_blank">
            {{ transactionResult.transactionHash }}
          </a>
        </div>
        <button @click="checkTransactionStatus" class="btn btn-info">
          检查交易状态
        </button>
      </div>

      <div v-if="transactionStatus" class="transaction-status">
        <div :class="statusClass">
          交易状态: {{ transactionStatusText }}
        </div>
        <div v-if="transactionStatus.blockNumber" class="block-info">
          区块号: {{ transactionStatus.blockNumber }}
        </div>
        <div v-if="transactionStatus.confirmations" class="confirmations">
          确认数: {{ transactionStatus.confirmations }}
        </div>
      </div>
    </div>

    <div v-else class="wallet-not-connected">
      <p>请先连接钱包以使用交易功能</p>
      <button @click="connectWallet" class="btn btn-primary">连接钱包</button>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers'
import { usePrivy } from '../contexts/PrivyContext.js'

export default {
  name: 'EthereumTransaction',
  props: {
    initialParams: {
      type: Object,
      default: null
    }
  },
  setup() {
    const privy = usePrivy()
    const { signMessage } = privy
    return { privy, signMessage }
  },
  data() {
    return {
      // 移除旧的钱包状态相关属性
      
      transactionType: 'eth',
      toAddress: '',
      selectedToken: 'USDT',
      amount: '',
      
      addressError: '',
      amountError: '',
      
      gasEstimation: null,
      isEstimating: false,
      isSending: false,
      
      transactionResult: null,
      transactionStatus: null,
      
      tokenAddresses: {
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
      }
    }
  },
  computed: {
    // 使用Privy上下文获取钱包连接状态
    walletConnected() {
      console.log('walletConnected 计算属性被调用')
      console.log('privy 对象:', this.privy)
      console.log('walletAddress:', this.privy?.walletAddress)
      console.log('walletAddress.value:', this.privy?.walletAddress?.value)
      console.log('currentWallet:', this.privy?.currentWallet)
      console.log('isAuthenticated:', this.privy?.isAuthenticated)
      
      const connected = !!(this.privy && this.privy.walletAddress && this.privy.walletAddress.value)
      console.log('walletConnected 状态:', connected)
      return connected
    },
    
    // 使用Privy上下文获取当前账户
    currentAccount() {
      return this.privy.walletAddress.value || null
    },
    
    isFormValid() {
      return this.toAddress && this.amount && this.isValidAddress(this.toAddress) && parseFloat(this.amount) > 0
    },
    
    transactionStatusText() {
      if (!this.transactionStatus) return ''
      
      switch (this.transactionStatus.status) {
        case 'pending': return '待确认'
        case 'confirmed': return '已确认'
        case 'failed': return '失败'
        default: return this.transactionStatus.status
      }
    },
    
    statusClass() {
      if (!this.transactionStatus) return ''
      
      switch (this.transactionStatus.status) {
        case 'pending': return 'status-pending'
        case 'confirmed': return 'status-confirmed'
        case 'failed': return 'status-failed'
        default: return ''
      }
    }
  },
  created() {
    // 不再需要订阅walletStore，直接使用Privy上下文
  },
  
  mounted() {
    // 处理初始参数
    if (this.initialParams) {
      console.log('接收到初始参数:', this.initialParams)
      
      // 根据参数设置默认值
      if (this.initialParams.type === 'buy') {
        // 买入时，设置默认收款地址为交易所地址或用户自己的地址
        this.toAddress = this.currentAccount || ''
        this.amount = this.initialParams.amount || '0.1'
      } else if (this.initialParams.type === 'sell') {
        // 卖出时，可以设置其他参数
        this.amount = this.initialParams.amount || '0.1'
      }
      
      // 如果用户点击了链上交易按钮，可以自动开始Gas估算
      if (this.initialParams.type && this.currentAccount) {
        setTimeout(() => {
          this.estimateGas()
        }, 1000)
      }
    }
  },
  
  beforeUnmount() {
    // 不再需要取消订阅
  },
  
  methods: {
    isValidAddress(address) {
      return ethers.isAddress(address)
    },
    
    async validateForm() {
      this.addressError = ''
      this.amountError = ''
      
      if (!this.toAddress) {
        this.addressError = '请输入收款地址'
        return false
      }
      
      if (!this.isValidAddress(this.toAddress)) {
        this.addressError = '无效的以太坊地址'
        return false
      }
      
      if (!this.amount || parseFloat(this.amount) <= 0) {
        this.amountError = '请输入有效的金额'
        return false
      }
      
      return true
    },
    
    async estimateGas() {
      if (!await this.validateForm()) return
      
      this.isEstimating = true
      
      try {
        // 构建请求参数
        const params = new URLSearchParams({
          to: this.toAddress,
          value: this.amount
        })
        
        if (this.transactionType === 'token') {
          // 对于代币交易，需要添加代币地址
          params.append('tokenAddress', this.tokenAddresses[this.selectedToken])
        }
        
        const response = await fetch(`http://localhost:3002/trading/ethereum/gas-estimation?${params}`)
        
        if (response.ok) {
          this.gasEstimation = await response.json()
          console.log('Gas估算结果:', this.gasEstimation)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Gas估算失败')
        }
      } catch (error) {
        console.error('Gas估算失败:', error)
        alert('Gas估算失败: ' + error.message)
      } finally {
        this.isEstimating = false
      }
    },
    
    async sendTransaction() {
      if (!await this.validateForm()) return
      
      console.log('=== 发送交易开始 ===');
      console.log('walletConnected:', this.walletConnected);
      console.log('currentAccount:', this.currentAccount);
      console.log('privy对象:', this.privy);
      console.log('privy.walletAddress:', this.privy?.walletAddress);
      console.log('privy.isAuthenticated:', this.privy?.isAuthenticated);
      
      // 检查钱包连接状态
      // if (!this.walletConnected || !this.currentAccount) {
      //   console.log('钱包未连接或账户不存在');
      //   alert('请先连接钱包')
      //   return
      // }
      
      this.isSending = true
      
      try {
        console.log('开始发送交易，当前账户:', this.currentAccount)
        
        // 使用Privy钱包签名
        let message
        let transactionData
        
        if (this.transactionType === 'eth') {
          message = `发送 ${this.amount} ETH 到 ${this.toAddress}`
          transactionData = {
            from: this.currentAccount,
            to: this.toAddress,
            amount: this.amount,
            signature: ''
          }
        } else {
          message = `发送 ${this.amount} ${this.selectedToken} 到 ${this.toAddress}`
          transactionData = {
            from: this.currentAccount,
            to: this.toAddress,
            tokenAddress: this.tokenAddresses[this.selectedToken],
            amount: this.amount,
            signature: ''
          }
        }
        
        console.log('交易数据:', transactionData)
        
        // 使用Privy签名消息
        const signature = await this.signMessage(message)
        if (!signature) {
          throw new Error('签名失败')
        }
        transactionData.signature = signature
        
        console.log('签名成功:', signature)
        
        // 调用后端API发送交易
        const endpoint = this.transactionType === 'eth' 
          ? 'http://localhost:3002/trading/ethereum/transaction/eth'
          : 'http://localhost:3002/trading/ethereum/transaction/token'
        
        console.log('调用后端API:', endpoint)
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData)
        })
        
        console.log('后端响应状态:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          this.transactionResult = result
          console.log('交易发送成功:', result)
          alert('交易提交成功!')
          
          // 开始监控交易状态
          if (result.transactionHash) {
            this.monitorTransaction(result.transactionHash)
          }
        } else {
          const errorText = await response.text()
          console.error('后端错误响应:', errorText)
          
          let errorMessage = '交易发送失败'
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorMessage
          } catch (e) {
            errorMessage = errorText || errorMessage
          }
          
          throw new Error(errorMessage)
        }
      } catch (error) {
        console.error('发送交易失败:', error)
        alert('交易失败: ' + error.message)
      } finally {
        this.isSending = false
      }
    },
    
    async monitorTransaction(transactionHash) {
      // 定期检查交易状态
      const checkInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:3002/trading/ethereum/transaction/${transactionHash}`)
          
          if (response.ok) {
            const status = await response.json()
            this.transactionStatus = status
            
            // 如果交易已确认或失败，停止监控
            if (status.status === 'confirmed' || status.status === 'failed') {
              clearInterval(checkInterval)
            }
          }
        } catch (error) {
          console.error('监控交易状态失败:', error)
          clearInterval(checkInterval)
        }
      }, 5000) // 每5秒检查一次
    },
    
    async checkTransactionStatus() {
      if (!this.transactionResult) return
      
      try {
        const response = await fetch(`http://localhost:3002/trading/ethereum/transaction/${this.transactionResult.transactionHash}`)
        
        if (response.ok) {
          this.transactionStatus = await response.json()
        } else {
          throw new Error('获取交易状态失败')
        }
      } catch (error) {
        console.error('获取交易状态失败:', error)
        alert('获取交易状态失败: ' + error.message)
      }
    },
    
    connectWallet() {
      // 钱包连接通过Privy处理
      console.log('请使用Privy登录')
    }
  }
}
</script>

<style scoped>
.ethereum-transaction {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.wallet-status .connected {
  background-color: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.account-info {
  margin-left: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #e2e8f0;
  font-size: 14px;
}

.form-input, .form-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: #f8fafc;
  transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.form-input:disabled {
  background-color: rgba(255, 255, 255, 0.02);
  color: #94a3b8;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
}

.gas-estimation {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.gas-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 500;
  color: #e2e8f0;
}

.gas-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #475569;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #475569;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background-color: #334155;
  transform: translateY(-1px);
}

.btn-info {
  background-color: #06b6d4;
  color: white;
}

.btn-info:hover {
  background-color: #0891b2;
  transform: translateY(-1px);
}

.transaction-result {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.success-message {
  color: #10b981;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 16px;
}

.tx-hash {
  font-size: 14px;
  margin-bottom: 12px;
  color: #e2e8f0;
}

.tx-hash a {
  color: #3b82f6;
  text-decoration: none;
  font-family: monospace;
}

.tx-hash a:hover {
  text-decoration: underline;
}

.transaction-status {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.status-pending {
  color: #f59e0b;
  font-weight: 600;
}

.status-confirmed {
  color: #10b981;
  font-weight: 600;
}

.status-failed {
  color: #ef4444;
  font-weight: 600;
}

.block-info, .confirmations {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 8px;
}

.wallet-not-connected {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 20px;
}

.wallet-not-connected p {
  margin-bottom: 20px;
  font-size: 16px;
}
</style>