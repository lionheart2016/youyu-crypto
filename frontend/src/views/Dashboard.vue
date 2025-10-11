<template>
  <div class="space-y-8">
    <!-- 欢迎区域 -->
    <div class="glass-effect rounded-2xl p-8">
      <h1 class="text-3xl font-bold mb-2">欢迎来到 YouyuCrypto</h1>
      <p class="text-gray-300">实时加密货币交易平台</p>
    </div>

    <!-- 价格走势图表 -->
    <PriceChart />

    <!-- 市场概览 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-effect rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-2">总市值</h3>
        <p class="text-2xl font-bold text-green-400">$2.1T</p>
        <p class="text-sm text-gray-400">+2.5% 24小时</p>
      </div>
      
      <div class="glass-effect rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-2">24小时交易量</h3>
        <p class="text-2xl font-bold text-blue-400">$85.3B</p>
        <p class="text-sm text-gray-400">+15.3% 24小时</p>
      </div>
      
      <div class="glass-effect rounded-xl p-6">
        <h3 class="text-lg font-semibold mb-2">活跃交易对</h3>
        <p class="text-2xl font-bold text-purple-400">1,234</p>
        <p class="text-sm text-gray-400">实时更新</p>
      </div>
    </div>

    <!-- 热门加密货币 -->
    <div class="glass-effect rounded-2xl p-6">
      <h2 class="text-2xl font-bold mb-6">热门加密货币</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CryptoCard 
          v-for="crypto in topCryptos" 
          :key="crypto.symbol"
          :crypto="crypto"
        />
      </div>
    </div>

    <!-- 快速交易 -->
    <div class="glass-effect rounded-2xl p-6">
      <h2 class="text-2xl font-bold mb-6">快速交易</h2>
      <QuickTrade />
    </div>
  </div>
</template>

<script>
import CryptoCard from '../components/CryptoCard.vue'
import QuickTrade from '../components/QuickTrade.vue'
import PriceChart from '../components/PriceChart.vue'

export default {
  name: 'Dashboard',
  components: {
    CryptoCard,
    QuickTrade,
    PriceChart
  },
  data() {
    return {
      topCryptos: [
        {
          name: 'Ethereum',
          symbol: 'ETH',
          price: 3250.42,
          change: 2.34,
          icon: '🟡'
        },
        {
          name: 'Bitcoin',
          symbol: 'BTC',
          price: 43250.67,
          change: 1.23,
          icon: '🟠'
        },
        {
          name: 'BNB',
          symbol: 'BNB',
          price: 315.78,
          change: -0.56,
          icon: '🟤'
        },
        {
          name: 'Solana',
          symbol: 'SOL',
          price: 102.45,
          change: 5.67,
          icon: '🟣'
        }
      ]
    }
  }
}
</script>