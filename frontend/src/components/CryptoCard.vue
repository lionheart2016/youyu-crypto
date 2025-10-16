<template>
  <div class="crypto-card glass-effect rounded-xl p-4 cursor-pointer">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-3">
        <span class="text-2xl">{{ crypto.icon }}</span>
        <div>
          <h3 class="font-semibold">{{ crypto.name }}</h3>
          <p class="text-gray-400 text-sm">{{ crypto.symbol }}</p>
        </div>
      </div>
      <div :class="priceChangeClass">
        {{ crypto.change > 0 ? '+' : '' }}{{ crypto.change }}%
      </div>
    </div>
    
    <div class="text-2xl font-bold mb-2">
      ${{ crypto.price.toLocaleString() }}
    </div>
    
    <div class="flex space-x-2 mb-2">
      <button 
        @click.stop="$emit('buy', crypto)"
        class="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
      >
        买入
      </button>
      <button 
        @click.stop="$emit('sell', crypto)"
        class="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
      >
        卖出
      </button>
    </div>
    
    <!-- 以太坊交易按钮 - 仅在ETH时显示 -->
    <div v-if="crypto.symbol === 'ETH'" class="flex space-x-2">
      <button 
        @click.stop="openEthereumTransaction('buy')"
        class="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        链上买入
      </button>
      <button 
        @click.stop="openEthereumTransaction('sell')"
        class="flex-1 bg-purple-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
      >
        链上卖出
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CryptoCard',
  props: {
    crypto: {
      type: Object,
      required: true
    }
  },
  computed: {
    priceChangeClass() {
      return {
        'text-green-400': this.crypto.change > 0,
        'text-red-400': this.crypto.change < 0,
        'text-gray-400': this.crypto.change === 0,
        'font-semibold': true
      }
    }
  },
  emits: ['buy', 'sell', 'ethereum-transaction'],
  methods: {
    openEthereumTransaction(type) {
      // 创建交易数据
      const transactionData = {
        type: type,
        crypto: this.crypto,
        amount: 0.1, // 默认数量
        price: this.crypto.price
      };
      
      // 如果当前在Dashboard页面，直接跳转到交易页面
      if (this.$route.path === '/') {
        this.$router.push({
          path: '/trading',
          query: {
            tab: 'ethereum',
            type: type,
            crypto: this.crypto.symbol,
            amount: 0.1
          }
        });
      } else {
        // 否则触发事件，让父组件处理
        this.$emit('ethereum-transaction', transactionData);
      }
    }
  }
}
</script>