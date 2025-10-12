<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">🛠️ 创建钱包功能诊断工具</h1>
      
      <!-- 状态概览 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">📊 系统状态概览</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 border rounded-lg">
            <div class="text-sm text-gray-600">Vue应用状态</div>
            <div class="text-lg font-semibold" :class="vueAppStatus.color">{{ vueAppStatus.text }}</div>
          </div>
          <div class="p-4 border rounded-lg">
            <div class="text-sm text-gray-600">React应用状态</div>
            <div class="text-lg font-semibold" :class="reactAppStatus.color">{{ reactAppStatus.text }}</div>
          </div>
          <div class="p-4 border rounded-lg">
            <div class="text-sm text-gray-600">认证状态</div>
            <div class="text-lg font-semibold" :class="authStatus.color">{{ authStatus.text }}</div>
          </div>
        </div>
      </div>

      <!-- 诊断控制 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">🔧 诊断控制</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button @click="checkSystemStatus" class="btn btn-blue">
            检查系统状态
          </button>
          <button @click="testIframeConnection" class="btn btn-green">
            测试iframe连接
          </button>
          <button @click="testMessagePassing" class="btn btn-purple">
            测试消息传递
          </button>
          <button @click="simulateWalletCreation" class="btn btn-orange">
            模拟创建钱包
          </button>
        </div>
      </div>

      <!-- 诊断结果 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">📋 诊断结果</h2>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div v-for="(result, index) in diagnosticResults" :key="index" 
               class="p-3 rounded-lg border-l-4"
               :class="getResultClass(result.type)">
            <div class="font-semibold">{{ result.title }}</div>
            <div class="text-sm text-gray-600">{{ result.message }}</div>
            <div v-if="result.details" class="text-xs text-gray-500 mt-1">{{ result.details }}</div>
          </div>
        </div>
      </div>

      <!-- 实时日志 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">📜 实时日志</h2>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          <div v-for="(log, index) in logs" :key="index" class="mb-1">
            <span class="text-gray-500">[{{ log.timestamp }}]</span>
            <span :class="getLogColor(log.type)">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 状态变量
const vueAppStatus = reactive({ text: '未知', color: 'text-gray-500' })
const reactAppStatus = reactive({ text: '未知', color: 'text-gray-500' })
const authStatus = reactive({ text: '未知', color: 'text-gray-500' })

const diagnosticResults = ref([])
const logs = ref([])

// 工具函数
const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ timestamp, message, type })
  
  // 保持日志数量在合理范围内
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(-100)
  }
}

const addDiagnosticResult = (title, message, type = 'info', details = null) => {
  diagnosticResults.value.push({ title, message, type, details })
  
  // 保持结果数量在合理范围内
  if (diagnosticResults.value.length > 50) {
    diagnosticResults.value = diagnosticResults.value.slice(-50)
  }
}

const getResultClass = (type) => {
  const classes = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800'
  }
  return classes[type] || classes.info
}

const getLogColor = (type) => {
  const colors = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    success: 'text-green-400',
    info: 'text-blue-400'
  }
  return colors[type] || 'text-green-400'
}

// 检查系统状态
const checkSystemStatus = async () => {
  addLog('开始检查系统状态...', 'info')
  
  try {
    // 检查Vue应用状态
    vueAppStatus.text = '运行中'
    vueAppStatus.color = 'text-green-600'
    addDiagnosticResult('Vue应用状态', 'Vue应用正在运行', 'success')
    
    // 检查React应用状态
    const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
    if (iframe) {
      reactAppStatus.text = '已加载'
      reactAppStatus.color = 'text-green-600'
      addDiagnosticResult('React应用状态', `React应用iframe已找到 (src: ${iframe.src})`, 'success')
      
      // 测试iframe响应
      try {
        iframe.contentWindow.postMessage({
          type: 'PING',
          timestamp: Date.now()
        }, iframe.src.includes('3001') ? 'http://localhost:3001' : 'http://localhost:3002')
        
        addDiagnosticResult('iframe响应测试', '消息发送成功，等待响应', 'info')
      } catch (error) {
        addDiagnosticResult('iframe响应测试', '消息发送失败', 'error', error.message)
      }
    } else {
      reactAppStatus.text = '未找到'
      reactAppStatus.color = 'text-red-600'
      addDiagnosticResult('React应用状态', 'React应用iframe未找到', 'error')
    }
    
    // 检查认证状态
    const privyContext = window.VueApp?.config?.globalProperties?.$privyContext
    if (privyContext) {
      const isAuthenticated = privyContext.authenticated?.value
      authStatus.text = isAuthenticated ? '已认证' : '未认证'
      authStatus.color = isAuthenticated ? 'text-green-600' : 'text-yellow-600'
      addDiagnosticResult('认证状态', `用户${isAuthenticated ? '已' : '未'}认证`, isAuthenticated ? 'success' : 'warning')
    } else {
      authStatus.text = '无法检测'
      authStatus.color = 'text-gray-600'
      addDiagnosticResult('认证状态', '无法访问Privy上下文', 'warning')
    }
    
    addLog('系统状态检查完成', 'success')
  } catch (error) {
    addLog(`系统状态检查失败: ${error.message}`, 'error')
    addDiagnosticResult('系统状态检查', '检查过程中出现错误', 'error', error.message)
  }
}

// 测试iframe连接
const testIframeConnection = () => {
  addLog('开始测试iframe连接...', 'info')
  
  const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
  if (!iframe) {
    addDiagnosticResult('iframe连接测试', '未找到目标iframe', 'error')
    addLog('未找到目标iframe', 'error')
    return
  }
  
  try {
    // 检查iframe的contentWindow
    const contentWindow = iframe.contentWindow
    addDiagnosticResult('iframe连接测试', 'contentWindow可访问', 'success')
    
    // 尝试获取iframe的location信息
    try {
      const href = contentWindow.location.href
      addDiagnosticResult('iframe连接测试', `iframe正在加载: ${href}`, 'success')
    } catch (error) {
      addDiagnosticResult('iframe连接测试', '跨域访问限制', 'warning', '这是正常的安全限制')
    }
    
    addLog('iframe连接测试完成', 'success')
  } catch (error) {
    addDiagnosticResult('iframe连接测试', '连接失败', 'error', error.message)
    addLog(`iframe连接测试失败: ${error.message}`, 'error')
  }
}

// 测试消息传递
const testMessagePassing = () => {
  addLog('开始测试消息传递...', 'info')
  
  const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
  if (!iframe) {
    addDiagnosticResult('消息传递测试', '未找到目标iframe', 'error')
    addLog('未找到目标iframe', 'error')
    return
  }
  
  try {
    const targetOrigin = iframe.src.includes('3001') ? 'http://localhost:3001' : 'http://localhost:3002'
    
    // 发送测试消息
    iframe.contentWindow.postMessage({
      type: 'TEST_MESSAGE',
      timestamp: Date.now(),
      data: 'Hello from diagnostic tool'
    }, targetOrigin)
    
    addDiagnosticResult('消息传递测试', '测试消息发送成功', 'success')
    addLog('测试消息已发送', 'success')
    
    // 等待响应
    setTimeout(() => {
      addDiagnosticResult('消息传递测试', '等待响应超时（5秒）', 'warning')
    }, 5000)
    
  } catch (error) {
    addDiagnosticResult('消息传递测试', '消息发送失败', 'error', error.message)
    addLog(`消息传递测试失败: ${error.message}`, 'error')
  }
}

// 模拟创建钱包
const simulateWalletCreation = async () => {
  addLog('开始模拟创建钱包流程...', 'info')
  
  try {
    // 步骤1: 检查认证状态
    addLog('步骤1: 检查认证状态...', 'info')
    const privyContext = window.VueApp?.config?.globalProperties?.$privyContext
    if (!privyContext || !privyContext.authenticated?.value) {
      addDiagnosticResult('创建钱包模拟', '用户未认证，需要先登录', 'warning')
      addLog('用户未认证，无法创建钱包', 'warning')
      return
    }
    
    addDiagnosticResult('创建钱包模拟', '用户已认证', 'success')
    addLog('用户已认证', 'success')
    
    // 步骤2: 检查iframe状态
    addLog('步骤2: 检查iframe状态...', 'info')
    const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
    if (!iframe) {
      addDiagnosticResult('创建钱包模拟', 'React应用iframe未找到', 'error')
      addLog('React应用iframe未找到', 'error')
      return
    }
    
    addDiagnosticResult('创建钱包模拟', 'React应用iframe已找到', 'success')
    addLog('React应用iframe已找到', 'success')
    
    // 步骤3: 发送创建钱包请求
    addLog('步骤3: 发送创建钱包请求...', 'info')
    const targetOrigin = iframe.src.includes('3001') ? 'http://localhost:3001' : 'http://localhost:3002'
    
    iframe.contentWindow.postMessage({
      type: 'CREATE_WALLET_REQUEST',
      timestamp: Date.now()
    }, targetOrigin)
    
    addDiagnosticResult('创建钱包模拟', '创建钱包请求已发送', 'success')
    addLog('创建钱包请求已发送', 'success')
    
    // 步骤4: 等待响应
    addLog('步骤4: 等待响应（30秒超时）...', 'info')
    
    // 设置超时
    const timeout = setTimeout(() => {
      addDiagnosticResult('创建钱包模拟', '等待响应超时', 'error')
      addLog('等待响应超时', 'error')
    }, 30000)
    
    // 临时消息监听器
    const messageHandler = (event) => {
      if (event.data.type === 'WALLET_CREATED') {
        clearTimeout(timeout)
        addDiagnosticResult('创建钱包模拟', '钱包创建成功！', 'success', JSON.stringify(event.data.wallet))
        addLog('钱包创建成功！', 'success')
        window.removeEventListener('message', messageHandler)
      } else if (event.data.type === 'PRIVY_ERROR') {
        clearTimeout(timeout)
        addDiagnosticResult('创建钱包模拟', '钱包创建失败', 'error', event.data.error)
        addLog(`钱包创建失败: ${event.data.error}`, 'error')
        window.removeEventListener('message', messageHandler)
      }
    }
    
    window.addEventListener('message', messageHandler)
    
  } catch (error) {
    addDiagnosticResult('创建钱包模拟', '模拟过程中出现错误', 'error', error.message)
    addLog(`创建钱包模拟失败: ${error.message}`, 'error')
  }
}

// 设置全局消息监听器
const setupGlobalMessageListener = () => {
  const messageHandler = (event) => {
    addLog(`收到消息: ${event.data.type} from ${event.origin}`, 'info')
    
    if (event.data.type === 'WALLET_CREATED') {
      addLog('🎉 钱包创建成功！', 'success')
    } else if (event.data.type === 'PRIVY_ERROR') {
      addLog(`❌ Privy错误: ${event.data.error}`, 'error')
    }
  }
  
  window.addEventListener('message', messageHandler)
  addLog('全局消息监听器已设置', 'info')
}

// 生命周期
onMounted(() => {
  addLog('诊断工具已加载', 'info')
  setupGlobalMessageListener()
  
  // 自动运行系统状态检查
  setTimeout(checkSystemStatus, 1000)
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
.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>