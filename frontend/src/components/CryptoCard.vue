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
    
    <div class="flex space-x-2">
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
  emits: ['buy', 'sell']
}
</script>