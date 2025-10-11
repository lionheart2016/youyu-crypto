<template>
  <div class="glass-effect rounded-2xl p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold">价格走势</h3>
      <div class="flex space-x-2">
        <button 
          v-for="period in timePeriods" 
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="[
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            selectedPeriod === period.value 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="h-64 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p class="text-gray-400">加载价格数据中...</p>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="h-64 flex items-center justify-center">
      <div class="text-center">
        <div class="text-red-400 text-2xl mb-2">⚠️</div>
        <p class="text-gray-400">{{ error }}</p>
        <button 
          @click="fetchChartData" 
          class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          重试
        </button>
      </div>
    </div>
    
    <!-- 正常状态 -->
    <div v-else class="relative">
      <canvas ref="chartCanvas" class="w-full" style="height: 300px;"></canvas>
    </div>
    
    <div class="mt-4 grid grid-cols-4 gap-4 text-center">
      <div>
        <p class="text-sm text-gray-400">开盘价</p>
        <p class="font-semibold">${{ formatPrice(chartData.open || 0) }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-400">最高价</p>
        <p class="font-semibold text-green-400">${{ formatPrice(chartData.high || 0) }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-400">最低价</p>
        <p class="font-semibold text-red-400">${{ formatPrice(chartData.low || 0) }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-400">当前价</p>
        <p class="font-semibold">${{ formatPrice(chartData.current || 0) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'PriceChart',
  data() {
    return {
      selectedPeriod: '24h',
      timePeriods: [
        { label: '24H', value: '24h' },
        { label: '7D', value: '7d' },
        { label: '1M', value: '1m' },
        { label: '1Y', value: '1y' }
      ],
      chartData: {
        labels: [],
        prices: [],
        open: 0,
        high: 0,
        low: 0,
        current: 0
      },
      chart: null,
      isLoading: true,
      error: null
    }
  },
  props: {
    symbol: {
      type: String,
      default: 'ETH'
    }
  },
  mounted() {
    this.fetchChartData()
    this.initChart()
    
    // 每30秒更新一次数据
    this.updateInterval = setInterval(() => {
      this.fetchChartData()
    }, 30000)
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    async fetchChartData() {
      try {
        this.isLoading = true
        this.error = null
        
        // 根据选择的周期确定天数
        const daysMap = {
          '24h': 1,
          '7d': 7,
          '1m': 30,
          '1y': 365
        }
        const days = daysMap[this.selectedPeriod] || 7
        
        // 调用后端API获取价格历史数据
        const response = await fetch(`/api/trading/price-history/${this.symbol}?days=${days}`)
        if (!response.ok) {
          throw new Error('获取价格历史数据失败')
        }
        
        const priceHistory = await response.json()
        
        // 处理数据格式
        const labels = []
        const prices = []
        
        priceHistory.forEach(item => {
          const date = new Date(item.timestamp)
          let label
          
          if (days <= 1) {
            // 24小时数据，显示小时
            label = date.getHours().toString().padStart(2, '0') + ':00'
          } else if (days <= 7) {
            // 7天数据，显示日期和时间
            label = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`
          } else {
            // 更长时间，只显示日期
            label = `${date.getMonth() + 1}/${date.getDate()}`
          }
          
          labels.push(label)
          prices.push(item.price)
        })
        
        this.chartData.labels = labels
        this.chartData.prices = prices
        this.chartData.open = prices[0] || 0
        this.chartData.high = Math.max(...prices) || 0
        this.chartData.low = Math.min(...prices) || 0
        this.chartData.current = prices[prices.length - 1] || 0
        
        // 更新图表
        if (this.chart) {
          this.chart.data.labels = labels
          this.chart.data.datasets[0].data = prices
          this.chart.update('none')
        } else {
          this.initChart()
        }
        
      } catch (error) {
        this.error = error.message
        console.error('获取价格图表数据错误:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    initChart() {
      if (this.chart) {
        this.chart.destroy()
      }
      
      const ctx = this.$refs.chartCanvas
      if (!ctx) return
      
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            label: `${this.symbol}/USDT`,
            data: this.chartData.prices,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#667eea',
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return `价格: $${context.parsed.y.toLocaleString()}`
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                borderDash: [5, 5]
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                borderDash: [5, 5]
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                callback: function(value) {
                  return '$' + value.toLocaleString()
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      })
    },
    
    formatPrice(price) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  },
  watch: {
    selectedPeriod(newPeriod) {
      // 根据选择的时间周期重新获取数据
      this.fetchChartData()
    }
  }
}
</script>