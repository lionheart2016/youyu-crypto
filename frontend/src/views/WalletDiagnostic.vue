<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🔍 创建钱包功能诊断中心
        </h1>
        <p class="text-xl text-gray-600 font-medium">专业级钱包创建功能诊断与问题排查</p>
        <div class="mt-6 w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>
      
      <!-- 快速状态卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div class="flex items-center">
            <div class="w-5 h-5 rounded-full mr-4 shadow-lg" :class="vueAppStatus.color"></div>
            <div>
              <div class="text-sm font-semibold text-gray-600 mb-1">Vue应用</div>
              <div class="text-xl font-bold text-gray-900">{{ vueAppStatus.text }}</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div class="flex items-center">
            <div class="w-5 h-5 rounded-full mr-4 shadow-lg" :class="reactAppStatus.color"></div>
            <div>
              <div class="text-sm font-semibold text-gray-600 mb-1">React应用</div>
              <div class="text-xl font-bold text-gray-900">{{ reactAppStatus.text }}</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div class="flex items-center">
            <div class="w-5 h-5 rounded-full mr-4 shadow-lg" :class="authStatus.color"></div>
            <div>
              <div class="text-sm font-semibold text-gray-600 mb-1">认证状态</div>
              <div class="text-xl font-bold text-gray-900">{{ authStatus.text }}</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div class="flex items-center">
            <div class="w-5 h-5 rounded-full mr-4 shadow-lg" :class="walletStatus.color"></div>
            <div>
              <div class="text-sm font-semibold text-gray-600 mb-1">钱包状态</div>
              <div class="text-xl font-bold text-gray-900">{{ walletStatus.text }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 核心诊断区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左侧：诊断控制 -->
        <div class="space-y-6">
          <!-- 快速诊断 -->
          <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <h2 class="text-2xl font-bold mb-6 flex items-center">
              <span class="mr-3">⚡</span>
              快速诊断
            </h2>
            <div class="space-y-4">
              <button @click="runQuickDiagnosis" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <span class="mr-2">🔍</span>
                运行完整诊断
              </button>
              <button @click="checkEnvironment" class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <span class="mr-2">🌍</span>
                检查环境
              </button>
              <button @click="testMessageSystem" class="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <span class="mr-2">💬</span>
                测试消息系统
              </button>
            </div>
          </div>
          
          <!-- 创建钱包测试 -->
          <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <h2 class="text-2xl font-bold mb-6 flex items-center">
              <span class="mr-3">💳</span>
              创建钱包测试
            </h2>
            <div class="space-y-4">
              <button @click="testCreateWallet" class="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-orange-800 disabled:to-orange-900 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" :disabled="isCreatingWallet">
                <span class="mr-2">{{ isCreatingWallet ? '⏳' : '💎' }}</span>
                {{ isCreatingWallet ? '创建中...' : '测试创建钱包' }}
              </button>
              <button @click="checkPrivyConfig" class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <span class="mr-2">⚙️</span>
                检查Privy配置
              </button>
            </div>
            <div v-if="walletCreationResult" class="mt-6 p-4 rounded-xl border-2" :class="getResultClass(walletCreationResult.type)">
              <div class="font-bold text-lg mb-2">{{ walletCreationResult.title }}</div>
              <div class="text-base">{{ walletCreationResult.message }}</div>
            </div>
          </div>
        </div>
        
        <!-- 右侧：诊断结果 -->
        <div class="space-y-6">
          <!-- 实时日志 -->
          <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <h2 class="text-2xl font-bold mb-6 flex items-center">
              <span class="mr-3">📜</span>
              实时日志
            </h2>
            <div class="bg-gray-900 text-green-300 p-6 rounded-xl font-mono text-base max-h-80 overflow-y-auto border-2 border-gray-700">
              <div v-for="(log, index) in logs" :key="index" class="mb-2 p-2 rounded border-l-4" :class="getLogClass(log.type)">
                <span class="text-gray-400 font-semibold">[{{ log.timestamp }}]</span>
                <span class="ml-3 font-medium" :class="getLogColor(log.type)">{{ log.message }}</span>
              </div>
              <div v-if="logs.length === 0" class="text-gray-500 text-center py-8">
                <div class="text-4xl mb-2">📜</div>
                <div class="text-lg">暂无日志记录</div>
                <div class="text-sm mt-1">运行诊断后将显示日志</div>
              </div>
            </div>
          </div>
          
          <!-- 诊断结果 -->
          <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <h2 class="text-2xl font-bold mb-6 flex items-center">
              <span class="mr-3">📋</span>
              诊断结果
            </h2>
            <div class="space-y-4 max-h-64 overflow-y-auto">
              <div v-for="(result, index) in diagnosticResults" :key="index" 
                   class="p-4 rounded-xl border-2"
                   :class="getResultClass(result.type)">
                <div class="font-bold text-lg mb-2">{{ result.title }}</div>
                <div class="text-base text-gray-700">{{ result.message }}</div>
              </div>
              <div v-if="diagnosticResults.length === 0" class="text-gray-500 text-center py-8">
                <div class="text-4xl mb-2">📋</div>
                <div class="text-lg">暂无诊断结果</div>
                <div class="text-sm mt-1">运行诊断后将显示结果</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 状态变量
const vueAppStatus = reactive({ text: '检测中...', color: 'bg-yellow-400' })
const reactAppStatus = reactive({ text: '检测中...', color: 'bg-yellow-400' })
const authStatus = reactive({ text: '检测中...', color: 'bg-yellow-400' })
const walletStatus = reactive({ text: '检测中...', color: 'bg-yellow-400' })

const logs = ref([])
const diagnosticResults = ref([])
const isCreatingWallet = ref(false)
const walletCreationResult = ref(null)

// 工具函数
const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ timestamp, message, type })
  if (logs.value.length > 50) logs.value = logs.value.slice(-50)
}

const addDiagnosticResult = (title, message, type = 'info') => {
  diagnosticResults.value.push({ title, message, type })
  if (diagnosticResults.value.length > 20) diagnosticResults.value = diagnosticResults.value.slice(-20)
}

const getResultClass = (type) => {
  const classes = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800'
  }
  return classes[type] || classes.info
}

const getLogColor = (type) => {
  const colors = {
    error: 'text-red-300 font-bold',
    warning: 'text-yellow-300 font-semibold',
    success: 'text-green-300 font-semibold',
    info: 'text-blue-300'
  }
  return colors[type] || 'text-green-300'
}

const getLogClass = (type) => {
  const classes = {
    error: 'border-red-500 bg-red-900/20',
    warning: 'border-yellow-500 bg-yellow-900/20',
    success: 'border-green-500 bg-green-900/20',
    info: 'border-blue-500 bg-blue-900/20'
  }
  return classes[type] || 'border-gray-500 bg-gray-900/20'
}

// 核心诊断功能
const runQuickDiagnosis = async () => {
  addLog('开始运行快速诊断...', 'info')
  diagnosticResults.value = []
  
  try {
    // 1. 检查Vue应用
    if (window.VueApp) {
      vueAppStatus.text = '运行中'
      vueAppStatus.color = 'bg-green-400'
      addDiagnosticResult('Vue应用', 'Vue应用实例已找到', 'success')
    } else {
      vueAppStatus.text = '未找到'
      vueAppStatus.color = 'bg-red-400'
      addDiagnosticResult('Vue应用', 'Vue应用实例未找到', 'error')
    }
    
    // 2. 检查React应用
    const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
    if (iframe) {
      reactAppStatus.text = '已加载'
      reactAppStatus.color = 'bg-green-400'
      addDiagnosticResult('React应用', `iframe已找到: ${iframe.src}`, 'success')
      
      // 测试iframe响应
      try {
        iframe.contentWindow.postMessage({ type: 'PING' }, '*')
        addDiagnosticResult('iframe通信', '可以向iframe发送消息', 'success')
      } catch (error) {
        addDiagnosticResult('iframe通信', '无法向iframe发送消息', 'error', error.message)
      }
    } else {
      reactAppStatus.text = '未找到'
      reactAppStatus.color = 'bg-red-400'
      addDiagnosticResult('React应用', 'iframe未找到', 'error')
    }
    
    // 3. 检查认证状态
    const privyContext = window.VueApp?.config?.globalProperties?.$privyContext
    if (privyContext) {
      if (privyContext.authenticated?.value) {
        authStatus.text = '已认证'
        authStatus.color = 'bg-green-400'
        addDiagnosticResult('认证状态', '用户已认证', 'success')
      } else {
        authStatus.text = '未认证'
        authStatus.color = 'bg-yellow-400'
        addDiagnosticResult('认证状态', '用户未认证', 'warning')
      }
    } else {
      authStatus.text = '无法检测'
      authStatus.color = 'bg-gray-400'
      addDiagnosticResult('认证状态', '无法访问Privy上下文', 'error')
    }
    
    // 4. 检查钱包状态
    if (privyContext?.walletAddress?.value) {
      walletStatus.text = '已连接'
      walletStatus.color = 'bg-green-400'
      addDiagnosticResult('钱包状态', `钱包地址: ${privyContext.walletAddress.value}`, 'success')
    } else {
      walletStatus.text = '未连接'
      walletStatus.color = 'bg-yellow-400'
      addDiagnosticResult('钱包状态', '钱包未连接', 'warning')
    }
    
    addLog('快速诊断完成', 'success')
  } catch (error) {
    addLog(`诊断失败: ${error.message}`, 'error')
    addDiagnosticResult('诊断错误', error.message, 'error')
  }
}

const checkEnvironment = () => {
  addLog('检查环境配置...', 'info')
  
  // 检查关键变量
  const checks = [
    { name: 'Vue应用实例', value: !!window.VueApp },
    { name: 'Privy上下文', value: !!window.VueApp?.config?.globalProperties?.$privyContext },
    { name: 'iframe元素', value: !!document.querySelector('iframe') },
    { name: 'React iframe', value: !!(document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')) }
  ]
  
  checks.forEach(check => {
    if (check.value) {
      addDiagnosticResult('环境检查', `${check.name}: 正常`, 'success')
    } else {
      addDiagnosticResult('环境检查', `${check.name}: 缺失`, 'warning')
    }
  })
  
  addLog('环境检查完成', 'info')
}

const testMessageSystem = () => {
  addLog('测试消息系统...', 'info')
  
  const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
  if (!iframe) {
    addDiagnosticResult('消息系统', 'React iframe未找到', 'error')
    return
  }
  
  // 设置临时监听器
  const messageHandler = (event) => {
    addLog(`收到消息: ${event.data.type}`, 'info')
    if (event.data.type === 'PONG') {
      addDiagnosticResult('消息系统', '收到PONG响应', 'success')
    }
  }
  
  window.addEventListener('message', messageHandler)
  
  // 发送测试消息
  try {
    iframe.contentWindow.postMessage({ type: 'PING', timestamp: Date.now() }, '*')
    addDiagnosticResult('消息系统', 'PING消息已发送', 'success')
  } catch (error) {
    addDiagnosticResult('消息系统', '发送消息失败', 'error', error.message)
  }
  
  // 5秒后移除监听器
  setTimeout(() => {
    window.removeEventListener('message', messageHandler)
  }, 5000)
}

const testCreateWallet = async () => {
  addLog('开始测试创建钱包...', 'info')
  isCreatingWallet.value = true
  walletCreationResult.value = null
  
  try {
    // 1. 检查认证状态
    const privyContext = window.VueApp?.config?.globalProperties?.$privyContext
    if (!privyContext?.authenticated?.value) {
      walletCreationResult.value = {
        title: '创建钱包失败',
        message: '用户未认证，无法创建钱包',
        type: 'error'
      }
      addLog('用户未认证，无法创建钱包', 'error')
      return
    }
    
    // 2. 检查React iframe
    const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
    if (!iframe) {
      walletCreationResult.value = {
        title: '创建钱包失败',
        message: 'React应用未找到',
        type: 'error'
      }
      addLog('React应用iframe未找到', 'error')
      return
    }
    
    // 3. 发送创建钱包请求
    addLog('发送创建钱包请求...', 'info')
    iframe.contentWindow.postMessage({
      type: 'CREATE_WALLET_REQUEST',
      timestamp: Date.now()
    }, '*')
    
    // 4. 等待响应
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('等待响应超时'))
      }, 30000)
      
      const messageHandler = (event) => {
        if (event.data.type === 'WALLET_CREATED') {
          clearTimeout(timeout)
          window.removeEventListener('message', messageHandler)
          resolve(event.data)
        } else if (event.data.type === 'PRIVY_ERROR') {
          clearTimeout(timeout)
          window.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error))
        }
      }
      
      window.addEventListener('message', messageHandler)
    })
    
    walletCreationResult.value = {
      title: '创建钱包成功！',
      message: `钱包地址: ${response.wallet?.address || '未知'}`,
      type: 'success'
    }
    addLog('钱包创建成功！', 'success')
    
  } catch (error) {
    walletCreationResult.value = {
      title: '创建钱包失败',
      message: error.message,
      type: 'error'
    }
    addLog(`创建钱包失败: ${error.message}`, 'error')
  } finally {
    isCreatingWallet.value = false
  }
}

const checkPrivyConfig = () => {
  addLog('检查Privy配置...', 'info')
  
  // 这里可以添加更多的Privy配置检查
  const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
  if (iframe) {
    addDiagnosticResult('Privy配置', 'React应用已加载，配置可能正常', 'info')
  } else {
    addDiagnosticResult('Privy配置', 'React应用未找到', 'error')
  }
}

// 生命周期
onMounted(() => {
  addLog('诊断工具已初始化', 'info')
  
  // 设置全局消息监听器
  const messageHandler = (event) => {
    addLog(`收到消息: ${event.data.type} from ${event.origin}`, 'info')
  }
  
  window.addEventListener('message', messageHandler)
  
  // 自动运行诊断
  setTimeout(runQuickDiagnosis, 1000)
})
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}
.btn-blue {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}
.btn-green {
  @apply bg-green-600 hover:bg-green-700 text-white;
}
.btn-purple {
  @apply bg-purple-600 hover:bg-purple-700 text-white;
}
.btn-orange {
  @apply bg-orange-600 hover:bg-orange-700 text-white;
}
.btn-indigo {
  @apply bg-indigo-600 hover:bg-indigo-700 text-white;
}
.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>