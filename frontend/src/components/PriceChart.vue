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
    
    <div class="relative">
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
      chart: null
    }
  },
  mounted() {
    this.generateChartData()
    this.initChart()
    
    // 模拟实时数据更新
    this.updateInterval = setInterval(() => {
      this.updateChartData()
    }, 5000)
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
            label: 'ETH/USDT',
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
              cornerRadius: 8
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
    
    generateChartData() {
      const basePrice = 3200
      const dataPoints = 24
      const labels = []
      const prices = []
      
      for (let i = 0; i < dataPoints; i++) {
        const hour = new Date(Date.now() - (dataPoints - i - 1) * 3600000)
        labels.push(hour.getHours().toString().padStart(2, '0') + ':00')
        
        // 模拟价格波动
        const volatility = Math.random() * 100 - 50
        const trend = i * 2 // 轻微上涨趋势
        const price = basePrice + volatility + trend
        prices.push(price)
      }
      
      this.chartData.labels = labels
      this.chartData.prices = prices
      this.chartData.open = prices[0]
      this.chartData.high = Math.max(...prices)
      this.chartData.low = Math.min(...prices)
      this.chartData.current = prices[prices.length - 1]
    },
    
    updateChartData() {
      if (!this.chartData.prices.length) return
      
      // 移除第一个数据点，添加新的数据点
      this.chartData.labels.shift()
      this.chartData.prices.shift()
      
      // 生成新的数据点
      const lastPrice = this.chartData.prices[this.chartData.prices.length - 1] || 3200
      const volatility = Math.random() * 20 - 10
      const newPrice = Math.max(3100, Math.min(3400, lastPrice + volatility))
      
      this.chartData.prices.push(newPrice)
      
      // 生成新的时间标签
      const now = new Date()
      this.chartData.labels.push(now.getHours().toString().padStart(2, '0') + ':' + 
                              now.getMinutes().toString().padStart(2, '0'))
      
      // 更新统计数据
      this.chartData.open = this.chartData.prices[0]
      this.chartData.high = Math.max(...this.chartData.prices)
      this.chartData.low = Math.min(...this.chartData.prices)
      this.chartData.current = newPrice
      
      // 更新图表
      if (this.chart) {
        this.chart.data.labels = this.chartData.labels
        this.chart.data.datasets[0].data = this.chartData.prices
        this.chart.update('none')
      }
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
      // 根据选择的时间周期重新生成数据
      this.generateChartData()
      this.initChart()
    }
  }
}
</script>