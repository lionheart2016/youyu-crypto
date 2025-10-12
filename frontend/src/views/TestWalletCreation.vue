<template>
  <div class="test-wallet-creation min-h-screen bg-gray-900 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          🔧 钱包创建测试页面
        </h1>
        <p class="text-xl text-gray-300 font-medium">测试Privy钱包创建功能 - 增强版调试</p>
        <div class="mt-6 w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
      </div>
        
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- 测试控制面板 -->
          <div class="bg-gray-800 rounded-lg p-8 border-2 border-gray-600 shadow-xl">
            <h3 class="text-2xl font-bold text-white mb-6 flex items-center">
              <span class="mr-3">🎮</span>
              测试控制面板
            </h3>
            
            <div class="space-y-6">
              <button 
                @click="testWalletCreation" 
                :disabled="isTesting || !isAuthenticated"
                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span class="mr-2">{{ isTesting ? '⏳' : '💎' }}</span>
                {{ isTesting ? '测试中...' : '测试创建钱包' }}
              </button>
              
              <button 
                @click="checkCurrentState" 
                class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span class="mr-2">🔍</span>
                检查当前状态
              </button>
              
              <button 
                @click="clearLogs" 
                class="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span class="mr-2">🧹</span>
                清空日志
              </button>
              
              <button 
                @click="loadConsoleLogger" 
                class="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span class="mr-2">🖥️</span>
                加载控制台日志器
              </button>
              
              <button 
                @click="loadDebugScript" 
                class="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span class="mr-2">🐛</span>
                加载调试脚本
              </button>
            </div>
            
            <!-- 当前状态显示 -->
            <div class="mt-8 p-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border-2 border-gray-600">
              <h4 class="text-white font-bold text-lg mb-4 flex items-center">
                <span class="mr-2">📊</span>
                当前状态
              </h4>
              <div class="text-base text-gray-200 space-y-3">
                <div class="flex justify-between items-center p-3 bg-gray-900 rounded-lg border border-gray-600">
                  <span class="font-semibold text-blue-300">认证状态:</span>
                  <span class="font-bold">{{ isAuthenticated ? '✅ 已认证' : '❌ 未认证' }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-900 rounded-lg border border-gray-600">
                  <span class="font-semibold text-green-300">钱包地址:</span>
                  <span class="font-mono text-sm">{{ walletAddress || '无' }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-900 rounded-lg border border-gray-600">
                  <span class="font-semibold text-purple-300">余额:</span>
                  <span class="font-bold">{{ walletBalance }} ETH</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-900 rounded-lg border border-gray-600">
                  <span class="font-semibold text-orange-300">测试中:</span>
                  <span class="font-bold">{{ isTesting ? '是' : '否' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 测试日志面板 -->
          <div class="bg-gray-800 rounded-lg p-8 border-2 border-gray-600 shadow-xl">
            <h3 class="text-2xl font-bold text-white mb-6 flex items-center">
              <span class="mr-3">📝</span>
              测试日志
            </h3>
            
            <div class="log-container bg-black rounded-xl p-6 h-96 overflow-y-auto font-mono text-sm border-2 border-gray-700">
              <div 
                v-for="(log, index) in logs" 
                :key="index"
                :class="getLogClass(log.type)"
                class="mb-2 p-2 rounded border-l-4"
              >
                <span class="text-gray-400 font-semibold">{{ log.timestamp }}</span>
                <span class="ml-3 font-medium">{{ log.message }}</span>
              </div>
              <div v-if="logs.length === 0" class="text-gray-500 text-center py-8">
                <div class="text-4xl mb-2">📝</div>
                <div class="text-lg">暂无日志记录</div>
                <div class="text-sm mt-1">执行测试操作后将显示日志</div>
              </div>
            </div>
          </div>
          
          <!-- 控制台日志面板 -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-xl font-semibold text-white mb-4">🖥️ 控制台日志</h3>
            
            <div id="console-log-container" class="console-log-container bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
              <!-- 控制台日志将在这里显示 -->
            </div>
          </div>
        </div>
        
        <!-- 错误信息显示 -->
        <div v-if="error" class="mt-8 bg-red-900 border border-red-700 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-red-400">{{ error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePrivy } from '../contexts/PrivyContext.js'

const {
  authenticated: isAuthenticated,
  walletAddress,
  walletBalance,
  loginWithPrivy
} = usePrivy()

const isTesting = ref(false)
const error = ref('')
const logs = ref([])

// 添加日志函数
const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({
    timestamp,
    message,
    type
  })
  
  // 滚动到最新日志
  setTimeout(() => {
    const logContainer = document.querySelector('.log-container')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, 100)
}

// 获取日志样式
const getLogClass = (type) => {
  switch (type) {
    case 'error':
      return 'text-red-300 font-bold border-red-500 bg-red-900/20'
    case 'success':
      return 'text-green-300 font-semibold border-green-500 bg-green-900/20'
    case 'warning':
      return 'text-yellow-300 font-semibold border-yellow-500 bg-yellow-900/20'
    default:
      return 'text-gray-200 border-gray-500 bg-gray-900/20'
  }
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  if (window.clearCapturedLogs) {
    window.clearCapturedLogs()
  }
  addLog('🧹 日志已清空，开始新的测试...')
}

// 检查当前状态
const checkCurrentState = () => {
  addLog('🔍 检查当前状态...')
  addLog(`📍 认证状态: ${isAuthenticated.value ? '✅ 已认证' : '❌ 未认证'}`)
  addLog(`💰 钱包地址: ${walletAddress.value || '无'}`)
  addLog(`💎 余额: ${walletBalance.value} ETH`)
  
  // 检查iframe
  const iframe = document.querySelector('iframe[src*="3001"]')
  if (iframe) {
    addLog('✅ React iframe 已找到')
    addLog(`🌐 iframe src: ${iframe.src}`)
    
    // 检查iframe是否可访问
    try {
      const test = iframe.contentWindow
      addLog('✅ iframe contentWindow 可访问')
    } catch (err) {
      addLog(`⚠️ iframe contentWindow 访问受限: ${err.message}`, 'warning')
    }
  } else {
    addLog('❌ React iframe 未找到', 'warning')
    
    // 检查是否有其他iframe
    const iframes = document.querySelectorAll('iframe')
    if (iframes.length > 0) {
      addLog(`📊 找到 ${iframes.length} 个iframe:`)
      iframes.forEach((iframe, index) => {
        addLog(`  ${index + 1}. ${iframe.src || '无src属性'}`)
      })
    }
  }
}

// 测试钱包创建
const testWalletCreation = async () => {
  error.value = ''
  addLog('🚀 开始测试创建钱包...')
  
  try {
    // 检查认证状态
    if (!isAuthenticated.value) {
      addLog('❌ 用户未认证，请先登录', 'error')
      error.value = '请先登录后再创建钱包'
      return
    }
    
    addLog('✅ 用户已认证')
    isTesting.value = true
    
    // 查找iframe
    const iframe = document.querySelector('iframe[src*="3001"]')
    if (!iframe) {
      addLog('❌ 未找到React iframe', 'error')
      throw new Error('React应用未加载')
    }
    
    addLog('✅ 找到React iframe')
    
    if (!iframe.contentWindow) {
      addLog('❌ iframe contentWindow 不可用', 'error')
      throw new Error('React应用不可用')
    }
    
    addLog('📤 发送CREATE_WALLET_REQUEST消息...')
    
    // 发送创建钱包请求
    iframe.contentWindow.postMessage({
      type: 'CREATE_WALLET_REQUEST',
      timestamp: Date.now(),
      test: true
    }, 'http://localhost:3001')
    
    addLog('✅ 创建钱包请求已发送')
    addLog('⏳ 等待响应...')
    
    // 设置超时
    const timeout = setTimeout(() => {
      addLog('⏰ 等待响应超时 (10秒)', 'warning')
      isTesting.value = false
    }, 10000)
    
    // 等待钱包地址更新
    const unwatch = walletAddress.watch((newAddress) => {
      if (newAddress) {
        clearTimeout(timeout)
        addLog('🎉 检测到钱包地址更新！', 'success')
        addLog(`💳 新地址: ${newAddress}`)
        isTesting.value = false
        unwatch() // 停止监听
      }
    })
    
  } catch (err) {
    addLog(`💥 创建钱包失败: ${err.message}`, 'error')
    error.value = err.message
    isTesting.value = false
  }
}

// 加载控制台日志器
const loadConsoleLogger = async () => {
  try {
    addLog('📥 正在加载控制台日志器...', 'info')
    
    // 动态加载控制台日志器脚本
    const script = document.createElement('script')
    script.src = '/console-logger.js'
    script.onload = () => {
      addLog('✅ 控制台日志器加载成功', 'success')
      console.log('🎯 控制台日志器已启动 - 所有console输出将被捕获')
      console.log('💡 可用命令:')
      console.log('  - window.exportLogs() - 导出所有捕获的日志')
      console.log('  - window.clearCapturedLogs() - 清空捕获的日志')
      console.log('  - window.capturedLogs - 查看所有捕获的日志数组')
    }
    script.onerror = () => {
      addLog('❌ 控制台日志器加载失败', 'error')
    }
    document.head.appendChild(script)
  } catch (error) {
    addLog(`❌ 加载控制台日志器失败: ${error.message}`, 'error')
  }
}

// 加载调试脚本
const loadDebugScript = () => {
  try {
    addLog('📥 正在加载调试脚本...', 'info')
    const script = document.createElement('script')
    script.src = '/debug_wallet_creation.js'
    script.onload = () => {
      addLog('✅ 调试脚本加载成功', 'success')
      if (window.debugWalletCreation) {
        setTimeout(() => {
          addLog('🔍 运行自动诊断...', 'info')
          window.debugWalletCreation.runDiagnosis()
        }, 1000)
      }
    }
    script.onerror = () => {
      addLog('❌ 调试脚本加载失败', 'error')
    }
    document.head.appendChild(script)
  } catch (error) {
    addLog(`❌ 加载调试脚本失败: ${error.message}`, 'error')
  }
}

// 监听钱包创建事件
const handleWalletCreated = (event) => {
  addLog('🎉 收到钱包创建成功事件！', 'success')
  addLog(`💳 地址: ${event.detail.address}`)
  addLog(`🔗 链: ${event.detail.chain}`)
}

// 监听消息
const handleMessage = (event) => {
  if (event.origin !== 'http://localhost:3001') return
  
  addLog(`📨 收到消息: ${event.data.type}`)
  
  switch (event.data.type) {
    case 'WALLET_CREATED':
      addLog('✅ 钱包创建成功！', 'success')
      addLog(`💳 地址: ${event.data.wallet.address}`)
      addLog(`🔗 链: ${event.data.wallet.chain}`)
      break
    case 'PRIVY_ERROR':
      addLog(`❌ Privy错误: ${event.data.error}`, 'error')
      error.value = event.data.error
      isTesting.value = false
      break
    case 'CREATE_WALLET_REQUEST':
      addLog('📤 发送创建钱包请求...')
      break
  }
}

onMounted(() => {
  addLog('🧪 创建钱包测试页面已加载')
  
  // 添加事件监听器
  window.addEventListener('message', handleMessage)
  window.addEventListener('wallet-created', handleWalletCreated)
  
  // 检查初始状态
  setTimeout(() => {
    checkCurrentState()
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
  window.removeEventListener('wallet-created', handleWalletCreated)
})
</script>

<style scoped>
.log-container {
  background: #000;
  border: 1px solid #333;
}

.log-container div {
  line-height: 1.4;
}

.log-container .text-red-400 {
  color: #f87171;
}

.log-container .text-green-400 {
  color: #4ade80;
}

.log-container .text-yellow-400 {
  color: #facc15;
}

.log-container .text-gray-300 {
  color: #d1d5db;
}

.log-container .text-gray-500 {
  color: #6b7280;
}

.console-log-container {
  background: #000;
  border: 1px solid #333;
  font-family: 'Courier New', monospace;
}

.console-log-container .console-log {
  margin-bottom: 2px;
  padding: 2px 4px;
  border-radius: 2px;
}

.console-log-container .console-timestamp {
  color: #666;
  font-size: 10px;
}

.console-log-container .console-type {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 9px;
  padding: 1px 3px;
  border-radius: 2px;
  margin: 0 4px;
}

.console-log-container .console-message {
  color: #e5e7eb;
}

.btn {
  @apply px-6 py-3 rounded-lg font-semibold transition-colors;
}
.btn-blue {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}
.btn-green {
  @apply bg-green-600 hover:bg-green-700 text-white;
}
.btn-red {
  @apply bg-red-600 hover:bg-red-700 text-white;
}
.btn-purple {
  @apply bg-purple-600 hover:bg-purple-700 text-white;
}
.btn-orange {
  @apply bg-orange-600 hover:bg-orange-700 text-white;
}
.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>