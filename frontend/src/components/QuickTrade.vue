<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 买入区域 -->
      <div class="glass-effect rounded-xl p-4">
        <h3 class="font-semibold mb-3 text-green-400">买入</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-gray-300 mb-1">选择币种</label>
            <select v-model="buyCrypto" class="app-select">
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
              class="app-input"
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
            <select v-model="sellCrypto" class="app-select">
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
              class="app-input"
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
      recentTrades: [],
      isLoading: false
    }
  },
  
  mounted() {
    this.fetchRecentTrades();
  },
  methods: {
    async executeBuy() {
      if (!this.buyAmount || parseFloat(this.buyAmount) <= 0) {
        alert('请输入有效的买入数量')
        return
      }
      
      try {
        this.isLoading = true;
        
        // 调用后端交易API
        const response = await fetch('/api/trading/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol: this.buyCrypto,
            type: 'buy',
            orderType: 'market',
            amount: parseFloat(this.buyAmount),
            price: 0 // 市价单价格为0
          })
        });
        
        if (!response.ok) {
          throw new Error('买入订单提交失败');
        }
        
        const result = await response.json();
        console.log('买入订单提交成功:', result);
        alert(`买入订单已提交: ${this.buyAmount} ${this.buyCrypto}`);
        
        // 刷新交易历史
        this.fetchRecentTrades();
        
      } catch (error) {
        console.error('买入订单提交失败:', error);
        alert('买入订单提交失败，请稍后重试');
      } finally {
        this.isLoading = false;
        this.buyAmount = '';
      }
    },
    
    async executeSell() {
      if (!this.sellAmount || parseFloat(this.sellAmount) <= 0) {
        alert('请输入有效的卖出数量')
        return
      }
      
      try {
        this.isLoading = true;
        
        // 调用后端交易API
        const response = await fetch('/api/trading/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol: this.sellCrypto,
            type: 'sell',
            orderType: 'market',
            amount: parseFloat(this.sellAmount),
            price: 0 // 市价单价格为0
          })
        });
        
        if (!response.ok) {
          throw new Error('卖出订单提交失败');
        }
        
        const result = await response.json();
        console.log('卖出订单提交成功:', result);
        alert(`卖出订单已提交: ${this.sellAmount} ${this.sellCrypto}`);
        
        // 刷新交易历史
        this.fetchRecentTrades();
        
      } catch (error) {
        console.error('卖出订单提交失败:', error);
        alert('卖出订单提交失败，请稍后重试');
      } finally {
        this.isLoading = false;
        this.sellAmount = '';
      }
    },
    
    async fetchRecentTrades() {
      try {
        const response = await fetch('/api/trading/recent-trades?limit=10');
        if (response.ok) {
          const trades = await response.json();
          this.recentTrades = trades.map(trade => ({
            id: trade.id,
            type: trade.type,
            crypto: trade.symbol,
            amount: trade.amount,
            time: new Date(trade.filledAt || trade.createdAt).toLocaleTimeString()
          }));
        }
      } catch (error) {
        console.error('获取交易历史失败:', error);
        this.recentTrades = [];
      }
    }
  }
}
</script>