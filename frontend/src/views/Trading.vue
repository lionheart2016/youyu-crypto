<template>
  <div class="space-y-8">
    <!-- 交易市场列表 -->
    <div class="glass-effect rounded-2xl p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">交易市场</h2>
        <div class="flex items-center space-x-4">
          <div class="wallet-status">
            <span :class="{ 'connected': walletConnected, 'disconnected': !walletConnected }" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ walletConnected ? '钱包已连接' : '钱包未连接' }}
            </span>
            <span v-if="walletConnected" class="account-info text-gray-300 text-sm ml-2">
              {{ currentAccount ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}` : '' }}
            </span>
          </div>
          <button 
            @click="fetchMarketData" 
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            :disabled="isLoading"
          >
            {{ isLoading ? '加载中...' : '刷新数据' }}
          </button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="space-y-2">
        <div v-for="n in 4" :key="n" class="border border-gray-600 rounded-lg p-4 animate-pulse">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div>
                <div class="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                <div class="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div class="text-right">
              <div class="h-5 bg-gray-700 rounded w-16 mb-1"></div>
              <div class="h-3 bg-gray-700 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-400 mb-2">⚠️ {{ error }}</div>
        <button 
          @click="fetchMarketData" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          重试
        </button>
      </div>
      
      <!-- 正常数据 -->
      <div v-else class="space-y-2">
        <div 
          v-for="market in marketList" 
          :key="market.pair"
          @click="selectPair(market.pair)"
          :class="[selectedPair === market.pair ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-800/50 border-gray-600', 'border rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700/50']"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-sm">{{ market.symbol }}</span>
              </div>
              <div>
                <h3 class="font-semibold text-white">{{ market.pair }}</h3>
                <p class="text-gray-400 text-sm">{{ market.name }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-white">${{ market.price.toLocaleString() }}</div>
              <div :class="[market.change >= 0 ? 'text-green-400' : 'text-red-400', 'text-sm font-medium']">
                {{ market.change >= 0 ? '+' : '' }}{{ market.change }}%
              </div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-400">24h 交易量</span>
              <div class="text-white font-medium">${{ market.volume.toLocaleString() }}</div>
            </div>
            <div>
              <span class="text-gray-400">24h 最高</span>
              <div class="text-white font-medium">${{ market.high.toLocaleString() }}</div>
            </div>
            <div>
              <span class="text-gray-400">24h 最低</span>
              <div class="text-white font-medium">${{ market.low.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 交易界面 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 价格图表 -->
      <div class="lg:col-span-2 glass-effect rounded-2xl p-6">
        <h3 class="text-xl font-semibold mb-4">{{ selectedPair }} 价格图表</h3>
        <div class="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          <p class="text-gray-400">价格图表区域 (集成 TradingView 或其他图表库)</p>
        </div>
        
        <!-- 订单簿 -->
        <div class="mt-6">
          <h4 class="font-semibold mb-3">订单簿</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h5 class="text-red-400 font-medium mb-2">卖出订单</h5>
              <div class="space-y-1">
                <div v-for="order in sellOrders" :key="order.id" class="flex justify-between text-sm">
                  <span class="text-red-400">{{ order.price }}</span>
                  <span class="text-gray-400">{{ order.amount }}</span>
                </div>
              </div>
            </div>
            <div>
              <h5 class="text-green-400 font-medium mb-2">买入订单</h5>
              <div class="space-y-1">
                <div v-for="order in buyOrders" :key="order.id" class="flex justify-between text-sm">
                  <span class="text-green-400">{{ order.price }}</span>
                  <span class="text-gray-400">{{ order.amount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 交易面板 -->
      <div class="glass-effect rounded-2xl p-6">
        <div class="trading-tabs mb-4">
          <button 
            @click="activeTab = 'exchange'" 
            :class="['tab-button', { active: activeTab === 'exchange' }]"
          >
            交易所交易
          </button>
          <button 
            @click="activeTab = 'ethereum'" 
            :class="['tab-button', { active: activeTab === 'ethereum' }]"
          >
            以太坊交易
          </button>
        </div>

        <div v-if="activeTab === 'exchange'">
          <h3 class="text-xl font-semibold mb-4">交易面板</h3>
          
          <!-- 限价单 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">订单类型</label>
              <select v-model="orderType" class="app-select">
                <option value="limit">限价单</option>
                <option value="market">市价单</option>
              </select>
            </div>
            
            <div v-if="orderType === 'limit'">
              <label class="block text-sm text-gray-300 mb-1">价格</label>
              <input 
                v-model="limitPrice" 
                type="number" 
                placeholder="0.00"
                class="app-input"
              >
            </div>
            
            <div>
              <label class="block text-sm text-gray-300 mb-1">数量</label>
              <input 
                v-model="orderAmount" 
                type="number" 
                placeholder="0.00"
                class="app-input"
              >
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <button 
                @click="placeOrder('buy')"
                class="bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                买入 {{ selectedPair.split('/')[0] }}
              </button>
              <button 
                @click="placeOrder('sell')"
                class="bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                卖出 {{ selectedPair.split('/')[0] }}
              </button>
            </div>
          </div>

          <!-- 当前价格 -->
          <div class="mt-6 p-4 bg-gray-800 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-gray-300">当前价格</span>
              <span class="text-2xl font-bold">${{ formatPrice(currentPrice) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-400 mt-2">
              <span>24h 最高: ${{ formatPrice(priceHigh) }}</span>
              <span>24h 最低: ${{ formatPrice(priceLow) }}</span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'ethereum'">
          <EthereumTransaction />
        </div>
      </div>
      
      <!-- 用户订单历史 -->
      <div class="user-orders-section" v-if="walletConnected">
        <h3 class="text-lg font-semibold mb-4">我的订单</h3>
        <div class="orders-list">
          <div class="order-item" v-for="order in userOrders" :key="order.id">
            <div class="order-info">
              <span :class="{ 'buy-order': order.type === 'buy', 'sell-order': order.type === 'sell' }">
                {{ order.type === 'buy' ? '买入' : '卖出' }}
              </span>
              <span>{{ order.symbol }}</span>
              <span>{{ order.amount }}</span>
              <span v-if="order.orderType === 'limit'">{{ order.price }}</span>
              <span :class="{ 'status-pending': order.status === 'pending', 'status-filled': order.status === 'filled', 'status-cancelled': order.status === 'cancelled' }">
                {{ order.status === 'pending' ? '待成交' : order.status === 'filled' ? '已成交' : '已取消' }}
              </span>
            </div>
            <button 
              v-if="order.status === 'pending'" 
              @click="cancelOrder(order.id)"
              class="cancel-btn"
            >
              取消
            </button>
          </div>
        </div>
        <button @click="fetchUserOrders" class="refresh-orders-btn">刷新订单</button>
      </div>
    </div>
  </div>
</template>

<script>
import walletStore from '../store/walletStore'
import EthereumTransaction from '../components/EthereumTransaction.vue'

export default {
  name: 'Trading',
  components: {
    EthereumTransaction
  },
  data() {
    return {
      activeTab: 'exchange',
      selectedPair: 'ETH/USDT',
      marketList: [],
      isLoading: true,
      error: null,
      orderType: 'limit',
      limitPrice: '',
      orderAmount: '',
      sellOrders: [],
      buyOrders: [],
      walletConnected: false,
      currentAccount: null,
      unsubscribe: null,
      userOrders: [],
      currentPrice: 0,
      priceHigh: 0,
      priceLow: 0
    }
  },
  created() {
    // 订阅钱包状态变化
    this.unsubscribe = walletStore.subscribe((state) => {
      this.walletConnected = state.isConnected
      this.currentAccount = state.account
    })
    
    // 初始化状态
    const state = walletStore.getState()
    this.walletConnected = state.isConnected
    this.currentAccount = state.account
  },
  
  beforeUnmount() {
    // 清理订阅
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  
  async mounted() {
    await this.fetchMarketData()
  },
  methods: {
    async fetchMarketData() {
      try {
        this.isLoading = true
        // 调用后端API获取以太坊市场数据
        const response = await fetch('/api/trading/market-data')
        if (!response.ok) {
          throw new Error('获取市场数据失败')
        }
        const marketData = await response.json()
        
        // 直接使用后端返回的数据格式
        this.marketList = marketData
        
        // 更新当前价格信息
        const selectedMarket = marketData.find(m => m.pair === this.selectedPair)
        if (selectedMarket) {
          this.currentPrice = selectedMarket.price
          this.priceHigh = selectedMarket.high
          this.priceLow = selectedMarket.low
        }
      } catch (error) {
        this.error = error.message
        console.error('获取市场数据错误:', error)
        // 如果API调用失败，显示错误信息
        this.marketList = []
      } finally {
        this.isLoading = false
      }
    },
    
    selectPair(pair) {
      this.selectedPair = pair
      this.fetchOrderBook(pair)
      this.fetchPriceChart(pair)
    },
    
    async fetchOrderBook(pair) {
      try {
        const response = await fetch(`/api/trading/orderbook/${pair}`)
        if (!response.ok) {
          throw new Error('获取订单簿失败')
        }
        const orderBook = await response.json()
        this.sellOrders = orderBook.sellOrders || []
        this.buyOrders = orderBook.buyOrders || []
      } catch (error) {
        console.error('获取订单簿错误:', error)
        // 如果API调用失败，清空订单簿数据
        this.sellOrders = []
        this.buyOrders = []
      }
    },
    
    async fetchPriceChart(pair) {
      try {
        const response = await fetch(`/api/trading/price-history/${pair}`)
        if (!response.ok) {
          throw new Error('获取价格图表数据失败')
        }
        // 这里可以处理图表数据，实际项目中会集成图表库
        const chartData = await response.json()
        console.log('图表数据:', chartData)
      } catch (error) {
        console.error('获取价格图表错误:', error)
      }
    },
    
    getCoinName(symbol) {
      const coinNames = {
        'eth': '以太坊',
        'btc': '比特币', 
        'bnb': '币安币',
        'sol': 'Solana'
      }
      return coinNames[symbol.toLowerCase()] || symbol
    },
    
    formatPrice(price) {
      if (!price) return '0.00'
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    

    
    async placeOrder(side) {
      // 检查钱包连接状态
      if (!this.walletConnected || !this.currentAccount) {
        alert('请先连接钱包')
        return
      }
      
      if (!this.orderAmount || parseFloat(this.orderAmount) <= 0) {
        alert('请输入有效的订单数量')
        return
      }
      
      if (this.orderType === 'limit' && (!this.limitPrice || parseFloat(this.limitPrice) <= 0)) {
        alert('请输入有效的限价价格')
        return
      }
      
      try {
        // 构建订单数据
        const orderData = {
          userId: this.currentAccount,
          symbol: this.selectedPair,
          type: side,
          orderType: this.orderType,
          amount: parseFloat(this.orderAmount),
          price: this.orderType === 'limit' ? parseFloat(this.limitPrice) : null
        }
        
        // 调用后端API创建订单
        const response = await fetch('/api/trading/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        })
        
        if (!response.ok) {
          throw new Error('订单提交失败')
        }
        
        const order = await response.json()
        
        console.log('订单提交成功:', order)
        alert(`${side === 'buy' ? '买入' : '卖出'}订单已提交成功`)
        
        // 刷新订单簿
        await this.fetchOrderBook(this.selectedPair)
        
        // 重置表单
        this.limitPrice = ''
        this.orderAmount = ''
        
      } catch (error) {
        console.error('提交订单错误:', error)
        alert(`订单提交失败: ${error.message}`)
      }
    },
    
    // 获取用户订单历史
    async fetchUserOrders() {
      if (!this.currentAccount) {
        this.userOrders = []
        return
      }
      
      try {
        const response = await fetch(`/api/trading/orders/${this.currentAccount}`)
        if (response.ok) {
          const orders = await response.json()
          this.userOrders = orders
          console.log('用户订单:', orders)
        } else {
          this.userOrders = []
        }
      } catch (error) {
        console.error('获取用户订单错误:', error)
        this.userOrders = []
      }
    },
    
    // 取消订单
    async cancelOrder(orderId) {
      if (!this.currentAccount) return
      
      try {
        const response = await fetch(`/api/trading/order/${orderId}/cancel?userId=${this.currentAccount}`, {
          method: 'PUT'
        })
        
        if (response.ok) {
          alert('订单取消成功')
          await this.fetchOrderBook(this.selectedPair)
          await this.fetchUserOrders()
        } else {
          throw new Error('取消订单失败')
        }
      } catch (error) {
        console.error('取消订单错误:', error)
        alert(`取消订单失败: ${error.message}`)
      }
    }
  }
}
</script>

<style scoped>
/* 钱包状态样式 */
.wallet-status .connected {
  background-color: #10b981;
  color: white;
}

.wallet-status .disconnected {
  background-color: #6b7280;
  color: white;
}

/* 标签页样式 */
.trading-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 16px;
  font-weight: 500;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #3b82f6;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.ethereum-content {
  margin-top: 20px;
}

/* 用户订单历史样式 */
.user-orders-section {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.orders-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(55, 65, 81, 0.5);
  border-radius: 0.5rem;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.order-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
}

.buy-order {
  color: #10b981;
  font-weight: 600;
}

.sell-order {
  color: #ef4444;
  font-weight: 600;
}

.status-pending {
  color: #f59e0b;
}

.status-filled {
  color: #10b981;
}

.status-cancelled {
  color: #6b7280;
}

.cancel-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #dc2626;
}

.refresh-orders-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.refresh-orders-btn:hover {
  background-color: #2563eb;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .order-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cancel-btn {
    align-self: flex-end;
    margin-top: 0.5rem;
  }
}
</style>