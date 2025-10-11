<template>
  <div class="space-y-8">
    <!-- 钱包概览 -->
    <div class="glass-effect rounded-2xl p-6">
      <h2 class="text-2xl font-bold mb-6">钱包概览</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 class="text-lg font-semibold mb-2">总资产</h3>
          <p class="text-3xl font-bold">${{ totalBalance.toLocaleString() }}</p>
          <p class="text-blue-200 text-sm mt-1">+2.3% 24小时</p>
        </div>
        
        <div class="glass-effect rounded-xl p-6">
          <h3 class="text-lg font-semibold mb-2">可用余额</h3>
          <p class="text-2xl font-bold">${{ availableBalance.toLocaleString() }}</p>
          <p class="text-gray-400 text-sm">可立即交易</p>
        </div>
        
        <div class="glass-effect rounded-xl p-6">
          <h3 class="text-lg font-semibold mb-2">持仓价值</h3>
          <p class="text-2xl font-bold">${{ portfolioValue.toLocaleString() }}</p>
          <p class="text-gray-400 text-sm">当前持仓</p>
        </div>
      </div>
    </div>

    <!-- 资产分布 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 持仓列表 -->
      <div class="glass-effect rounded-2xl p-6">
        <h3 class="text-xl font-semibold mb-4">我的持仓</h3>
        <div class="space-y-3">
          <div 
            v-for="holding in holdings" 
            :key="holding.symbol"
            class="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">{{ holding.icon }}</span>
              <div>
                <h4 class="font-semibold">{{ holding.name }}</h4>
                <p class="text-gray-400 text-sm">{{ holding.symbol }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold">{{ holding.amount }}</p>
              <p class="text-gray-400 text-sm">${{ holding.value.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 资产分布图表 -->
      <div class="glass-effect rounded-2xl p-6">
        <h3 class="text-xl font-semibold mb-4">资产分布</h3>
        <div class="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          <p class="text-gray-400">资产分布图表区域</p>
        </div>
        <div class="mt-4 space-y-2">
          <div 
            v-for="asset in assetDistribution" 
            :key="asset.name"
            class="flex justify-between items-center"
          >
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: asset.color }"></div>
              <span class="text-sm">{{ asset.name }}</span>
            </div>
            <span class="text-sm font-medium">{{ asset.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 交易历史 -->
    <div class="glass-effect rounded-2xl p-6">
      <h3 class="text-xl font-semibold mb-4">交易历史</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="text-left py-3 text-gray-400 font-medium">时间</th>
              <th class="text-left py-3 text-gray-400 font-medium">类型</th>
              <th class="text-left py-3 text-gray-400 font-medium">币种</th>
              <th class="text-left py-3 text-gray-400 font-medium">数量</th>
              <th class="text-left py-3 text-gray-400 font-medium">价格</th>
              <th class="text-left py-3 text-gray-400 font-medium">总额</th>
              <th class="text-left py-3 text-gray-400 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="transaction in transactions" 
              :key="transaction.id"
              class="border-b border-gray-800"
            >
              <td class="py-3 text-sm">{{ transaction.time }}</td>
              <td>
                <span :class="transaction.type === 'buy' ? 'text-green-400' : 'text-red-400'">
                  {{ transaction.type === 'buy' ? '买入' : '卖出' }}
                </span>
              </td>
              <td class="text-sm">{{ transaction.crypto }}</td>
              <td class="text-sm">{{ transaction.amount }}</td>
              <td class="text-sm">${{ transaction.price }}</td>
              <td class="text-sm">${{ transaction.total }}</td>
              <td>
                <span :class="{
                  'text-green-400': transaction.status === 'completed',
                  'text-yellow-400': transaction.status === 'pending',
                  'text-red-400': transaction.status === 'failed'
                }">
                  {{ getStatusText(transaction.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Wallet',
  data() {
    return {
      totalBalance: 15420.67,
      availableBalance: 8920.45,
      portfolioValue: 6500.22,
      holdings: [
        {
          name: 'Ethereum',
          symbol: 'ETH',
          icon: '🟡',
          amount: 2.75,
          value: 8937.65
        },
        {
          name: 'Bitcoin',
          symbol: 'BTC',
          icon: '🟠',
          amount: 0.15,
          value: 6485.10
        }
      ],
      assetDistribution: [
        { name: 'Ethereum', percentage: 58, color: '#8B5CF6' },
        { name: 'Bitcoin', percentage: 42, color: '#F59E0B' }
      ],
      transactions: [
        {
          id: 1,
          time: '2024-01-15 14:30',
          type: 'buy',
          crypto: 'ETH',
          amount: 0.5,
          price: 3250.42,
          total: 1625.21,
          status: 'completed'
        },
        {
          id: 2,
          time: '2024-01-14 10:15',
          type: 'sell',
          crypto: 'BTC',
          amount: 0.02,
          price: 43250.67,
          total: 865.01,
          status: 'completed'
        },
        {
          id: 3,
          time: '2024-01-13 16:45',
          type: 'buy',
          crypto: 'ETH',
          amount: 1.0,
          price: 3220.15,
          total: 3220.15,
          status: 'pending'
        }
      ]
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        'completed': '已完成',
        'pending': '处理中',
        'failed': '失败'
      }
      return statusMap[status] || status
    }
  }
}
</script>