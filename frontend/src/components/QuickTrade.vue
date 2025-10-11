<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 买入区域 -->
      <div class="glass-effect rounded-xl p-4">
        <h3 class="font-semibold mb-3 text-green-400">买入</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-gray-300 mb-1">选择币种</label>
            <select v-model="buyCrypto" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
              <option value="ETH">ETH - Ethereum</option>
              <option value="BTC">BTC - Bitcoin</option>
              <option value="BNB">BNB - Binance Coin</option>
              <option value="SOL">SOL - Solana</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-300 mb-1">数量</label>
            <input 
              v-model="buyAmount" 
              type="number" 
              placeholder="0.00"
              class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
          </div>
          <button 
            @click="executeBuy"
            class="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            立即买入
          </button>
        </div>
      </div>

      <!-- 卖出区域 -->
      <div class="glass-effect rounded-xl p-4">
        <h3 class="font-semibold mb-3 text-red-400">卖出</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-gray-300 mb-1">选择币种</label>
            <select v-model="sellCrypto" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
              <option value="ETH">ETH - Ethereum</option>
              <option value="BTC">BTC - Bitcoin</option>
              <option value="BNB">BNB - Binance Coin</option>
              <option value="SOL">SOL - Solana</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-300 mb-1">数量</label>
            <input 
              v-model="sellAmount" 
              type="number" 
              placeholder="0.00"
              class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
          </div>
          <button 
            @click="executeSell"
            class="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            立即卖出
          </button>
        </div>
      </div>
    </div>

    <!-- 交易历史 -->
    <div class="glass-effect rounded-xl p-4">
      <h3 class="font-semibold mb-3">最近交易</h3>
      <div class="space-y-2">
        <div 
          v-for="trade in recentTrades" 
          :key="trade.id"
          class="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
        >
          <div>
            <span :class="trade.type === 'buy' ? 'text-green-400' : 'text-red-400'">
              {{ trade.type === 'buy' ? '买入' : '卖出' }}
            </span>
            <span class="text-gray-300 ml-2">{{ trade.amount }} {{ trade.crypto }}</span>
          </div>
          <div class="text-gray-400 text-sm">
            {{ trade.time }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickTrade',
  data() {
    return {
      buyCrypto: 'ETH',
      buyAmount: '',
      sellCrypto: 'ETH',
      sellAmount: '',
      recentTrades: [
        {
          id: 1,
          type: 'buy',
          crypto: 'ETH',
          amount: 0.1,
          time: '10:30 AM'
        },
        {
          id: 2,
          type: 'sell',
          crypto: 'BTC',
          amount: 0.01,
          time: '09:15 AM'
        }
      ]
    }
  },
  methods: {
    executeBuy() {
      if (!this.buyAmount || parseFloat(this.buyAmount) <= 0) {
        alert('请输入有效的买入数量')
        return
      }
      
      // 这里应该调用实际的交易API
      console.log(`买入 ${this.buyAmount} ${this.buyCrypto}`)
      alert(`买入订单已提交: ${this.buyAmount} ${this.buyCrypto}`)
      
      // 添加到交易历史
      this.recentTrades.unshift({
        id: Date.now(),
        type: 'buy',
        crypto: this.buyCrypto,
        amount: parseFloat(this.buyAmount),
        time: new Date().toLocaleTimeString()
      })
      
      this.buyAmount = ''
    },
    
    executeSell() {
      if (!this.sellAmount || parseFloat(this.sellAmount) <= 0) {
        alert('请输入有效的卖出数量')
        return
      }
      
      // 这里应该调用实际的交易API
      console.log(`卖出 ${this.sellAmount} ${this.sellCrypto}`)
      alert(`卖出订单已提交: ${this.sellAmount} ${this.sellCrypto}`)
      
      // 添加到交易历史
      this.recentTrades.unshift({
        id: Date.now(),
        type: 'sell',
        crypto: this.sellCrypto,
        amount: parseFloat(this.sellAmount),
        time: new Date().toLocaleTimeString()
      })
      
      this.sellAmount = ''
    }
  }
}
</script>