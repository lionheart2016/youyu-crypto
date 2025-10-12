<template>
  <div class="test-sync">
    <h1>🔧 状态同步测试页面</h1>
    
    <!-- 调试信息面板 -->
    <div class="debug-panel">
      <h3>🐛 调试信息</h3>
      <div class="debug-grid">
        <div class="debug-card">
          <h4>前端状态</h4>
          <p><strong>已认证:</strong> {{ isAuthenticated ? '是' : '否' }}</p>
          <p><strong>钱包地址:</strong> {{ walletAddress || '无' }}</p>
          <p><strong>钱包余额:</strong> {{ walletBalance || '0' }} ETH</p>
          <p><strong>就绪状态:</strong> {{ ready ? '就绪' : '未就绪' }}</p>
        </div>
        
        <div class="debug-card">
          <h4>用户信息</h4>
          <p><strong>用户ID:</strong> {{ user?.id || '无' }}</p>
          <p><strong>用户姓名:</strong> {{ user?.name || '无' }}</p>
          <p><strong>用户邮箱:</strong> {{ user?.email || '无' }}</p>
          <p><strong>用户类型:</strong> {{ user?.type || '无' }}</p>
        </div>
        
        <div class="debug-card">
          <h4>iframe状态</h4>
          <p><strong>显示状态:</strong> {{ showIframe ? '显示' : '隐藏' }}</p>
          <p><strong>加载状态:</strong> {{ loading ? '加载中' : '空闲' }}</p>
          <p><strong>错误信息:</strong> {{ error || '无' }}</p>
        </div>
        
        <div class="debug-card">
          <h4>原始用户信息</h4>
          <pre class="user-raw-data">{{ user ? JSON.stringify(user, null, 2) : '无用户信息' }}</pre>
        </div>
        
        <div class="debug-card">
          <h4>状态摘要 (计算属性)</h4>
          <pre class="user-raw-data">{{ JSON.stringify(stateSummary, null, 2) }}</pre>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮区域 -->
    <div class="action-panel">
      <h3>🎮 测试操作</h3>
      <div class="button-grid">
        <button @click="testLogin" class="btn btn-primary" :disabled="loading">
          {{ loading ? '登录中...' : '测试登录' }}
        </button>
        <button @click="testLogout" class="btn btn-secondary" :disabled="loading">
          {{ loading ? '登出中...' : '测试登出' }}
        </button>
        <button @click="forceSync" class="btn btn-info" :disabled="loading">
          {{ loading ? '同步中...' : '强制同步' }}
        </button>
        <button @click="checkCurrentState" class="btn btn-warning">
          检查当前状态
        </button>
        <button @click="toggleIframe" class="btn btn-warning">
          {{ showIframe ? '隐藏iframe' : '显示iframe' }}
        </button>
        <button @click="testCommunication" class="btn btn-info">
          测试消息通信
        </button>
        <button @click="logout" class="btn btn-danger" :disabled="loading">
          {{ loading ? '登出中...' : '登出' }}
        </button>
      </div>
    </div>
    
    <!-- 测试创建钱包区域 -->
    <div class="action-panel">
      <h3>💳 测试创建钱包</h3>
      <div class="button-grid">
        <button @click="testCreateWallet" class="btn btn-primary" :disabled="!isAuthenticated || isCreatingWallet">
          {{ isCreatingWallet ? '⏳ 创建中...' : '💎 测试创建钱包' }}
        </button>
        <button @click="checkWalletStatus" class="btn btn-info">
          🔍 检查钱包状态
        </button>
      </div>
    </div>
    
    <!-- 消息日志 -->
    <div class="log-panel">
      <h3>📋 消息日志</h3>
      <div class="log-container">
        <div 
          v-for="(log, index) in messageLogs" 
          :key="index" 
          class="log-entry"
          :class="log.type"
        >
          <span class="timestamp">{{ log.timestamp }}</span>
          <span class="message">{{ log.message }}</span>
        </div>
        <div v-if="messageLogs.length === 0" class="no-logs">
          暂无日志消息
        </div>
      </div>
      <button @click="clearLogs" class="btn btn-small">清除日志</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { testMessageCommunication, testStateSync, testManualLogin, testManualLogout } from '../utils/syncTest.js'
import { usePrivy } from '../contexts/PrivyContext'

const {
    ready,
    isAuthenticated,
    user,
    walletAddress,
    walletBalance,
    loading,
    error,
    showIframe,
    login,
    logout,
    showPrivyIframe,
    hidePrivyIframe,
    manualSync,
    checkCurrentState,
    stateSummary
  } = usePrivy()

const messageLogs = ref([])
const isCreatingWallet = ref(false)

// 添加日志
const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  messageLogs.value.unshift({ timestamp, message, type })
  
  // 保持最多20条日志
  if (messageLogs.value.length > 20) {
    messageLogs.value = messageLogs.value.slice(0, 20)
  }
}

// 清除日志
const clearLogs = () => {
  messageLogs.value = []
  addLog('日志已清除', 'info')
}

// 测试登录
const testLogin = async () => {
  addLog('开始测试登录...', 'info')
  try {
    await login('wallet') // 使用钱包登录方式
    addLog('登录请求已发送', 'success')
  } catch (err) {
    addLog(`登录失败: ${err.message}`, 'error')
  }
}

// 测试登出
const testLogout = async () => {
  addLog('开始测试登出...', 'info')
  try {
    await logout() // 使用正确的logout函数
    addLog('登出请求已发送', 'success')
  } catch (err) {
    addLog(`登出失败: ${err.message}`, 'error')
  }
}

// 强制同步
const forceSync = () => {
  addLog('开始强制同步状态...', 'info')
  try {
    testStateSync() // 使用测试工具中的状态同步函数
    addLog('状态同步请求已发送', 'success')
  } catch (err) {
    addLog(`同步失败: ${err.message}`, 'error')
  }
}



// 切换iframe显示
const toggleIframe = () => {
  if (showIframe.value) {
    hidePrivyIframe()
    addLog('iframe已隐藏', 'info')
  } else {
    showPrivyIframe()
    addLog('iframe已显示', 'info')
  }
}

// 测试消息通信
const testCommunication = () => {
  console.log('🧪 测试消息通信...')
  addLog('开始测试消息通信...', 'info')
  testMessageCommunication()
  addLog('消息通信测试已启动，请查看控制台输出', 'success')
}

// 测试创建钱包
const testCreateWallet = async () => {
  try {
    isCreatingWallet.value = true
    addLog('开始测试创建钱包...', 'info')
    
    // 1. 检查认证状态
    if (!isAuthenticated.value) {
      throw new Error('用户未认证，请先连接钱包')
    }
    
    // 2. 检查React应用
    const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]')
    if (!iframe) {
      throw new Error('React应用未找到')
    }
    
    addLog('React应用已找到，准备发送创建钱包请求...', 'info')
    
    // 3. 发送创建钱包请求
    const targetOrigin = iframe.src.includes('3001') ? 'http://localhost:3001' : 'http://localhost:3002'
    
    // 添加调试信息
    addLog(`发送创建钱包请求到: ${targetOrigin}`, 'info')
    addLog(`当前认证状态: ${isAuthenticated.value}`, 'info')
    addLog(`用户信息: ${user.value ? JSON.stringify(user.value) : '无'}`, 'info')
    addLog(`iframe src: ${iframe.src}`, 'info') // 添加iframe源信息
    addLog(`iframe contentWindow存在: ${!!iframe.contentWindow}`, 'info') // 检查contentWindow是否存在
    
    // 检查iframe是否已加载完成
    if (!iframe.contentWindow) {
      throw new Error('iframe contentWindow未准备好')
    }
    
    iframe.contentWindow.postMessage({
      type: 'CREATE_WALLET_REQUEST',
      timestamp: Date.now()
    }, targetOrigin)
    
    addLog('创建钱包请求已发送，等待响应...', 'info')
    
    // 4. 等待响应
    const response = await Promise.race([
      new Promise((resolve, reject) => {
        const messageHandler = (event) => {
          addLog(`收到消息类型: ${event.data.type}`, 'info') // 添加调试日志
          if (event.data.type === 'WALLET_CREATED') {
            window.removeEventListener('message', messageHandler)
            resolve(event.data)
          } else if (event.data.type === 'PRIVY_ERROR') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(event.data.error))
          }
        }
        window.addEventListener('message', messageHandler)
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('等待响应超时')), 30000))
    ])
    
    addLog('钱包创建成功！', 'success')
    addLog(`钱包地址: ${response.wallet?.address || '未知'}`, 'success')
    
  } catch (error) {
    addLog(`创建钱包失败: ${error.message}`, 'error')
    console.error('创建钱包失败:', error) // 添加控制台错误日志
  } finally {
    isCreatingWallet.value = false
  }
}

// 检查钱包状态
const checkWalletStatus = () => {
  addLog('检查钱包状态...', 'info')
  
  const hasWallet = !!walletAddress.value
  if (hasWallet) {
    addLog(`钱包已连接: ${walletAddress.value}`, 'success')
  } else {
    addLog('钱包未连接', 'warning')
  }
}



// 监听状态变化
watch([isAuthenticated, user, walletAddress, walletBalance], ([newAuth, newUser, newWallet, newBalance], [oldAuth, oldUser, oldWallet, oldBalance]) => {
  console.log('=== 状态变化监听器 ===')
  console.log('isAuthenticated:', oldAuth, '->', newAuth)
  console.log('user:', oldUser, '->', newUser)
  console.log('walletAddress:', oldWallet, '->', newWallet)
  console.log('walletBalance:', oldBalance, '->', newBalance)
  
  addLog(`状态变化 - 认证: ${oldAuth}->${newAuth}, 用户: ${oldUser ? '有' : '无'}->${newUser ? '有' : '无'}, 钱包: ${oldWallet || '无'}->${newWallet || '无'}`, 'info')
}, { deep: true })

// 添加详细的状态监控
watch(isAuthenticated, (newVal) => {
  console.log('认证状态变化:', newVal)
})

watch(user, (newVal) => {
  console.log('用户信息变化:', newVal)
})

watch(walletAddress, (newVal) => {
  console.log('钱包地址变化:', newVal)
})

watch(walletBalance, (newVal) => {
  console.log('钱包余额变化:', newVal)
})

// 监听消息事件
const handleMessage = (event) => {
  console.log('TestSync收到消息:', event.data, '来源:', event.origin)
  
  if (event.origin !== 'http://localhost:3001') {
    console.log('消息来源不匹配，跳过处理')
    return
  }
  
  const messageType = event.data.type
  let logMessage = `收到消息: ${messageType}`
  
  switch (messageType) {
    case 'PRIVY_AUTH_STATE':
      logMessage += ` - 认证: ${event.data.authenticated ? '是' : '否'}`
      logMessage += ` - 用户: ${event.data.user ? (event.data.user.email || event.data.user.name || '已设置') : '无'}`
      addLog(logMessage, 'success')
      console.log('认证状态消息详情:', event.data)
      break
    case 'PRIVY_LOGIN_SUCCESS':
      addLog('收到登录成功消息', 'success')
      break
    case 'PRIVY_LOGOUT_SUCCESS':
      addLog('收到登出成功消息', 'success')
      break
    case 'SYNC_AUTH_STATE':
      addLog('收到状态同步请求', 'info')
      break
    default:
      addLog(logMessage, 'info')
  }
}

onMounted(() => {
  addLog('测试页面已加载', 'info')
  window.addEventListener('message', handleMessage)
  
  // 立即检查状态
  console.log('组件挂载时的状态:', {
    ready: ready.value,
    isAuthenticated: isAuthenticated.value,
    user: user.value,
    walletAddress: walletAddress.value,
    walletBalance: walletBalance.value,
    showIframe: showIframe.value,
    loading: loading.value,
    error: error.value
  })
  
  // 延迟状态检查，确保初始化完成
  setTimeout(() => {
    console.log('延迟状态检查:', {
      ready: ready.value,
      isAuthenticated: isAuthenticated.value,
      user: user.value,
      walletAddress: walletAddress.value,
      walletBalance: walletBalance.value,
      showIframe: showIframe.value,
      loading: loading.value,
      error: error.value
    })
    addLog(`初始状态 - 认证: ${isAuthenticated.value ? '是' : '否'}`, 'info')
    addLog(`用户信息: ${user.value ? (user.value.email || user.value.name || '已设置') : '无'}`, 'info')
    addLog(`钱包地址: ${walletAddress.value || '无'}`, 'info')
  }, 1000)
  
  // 添加定期状态检查
  const statusInterval = setInterval(() => {
    console.log('定期状态检查:', {
      ready: ready.value,
      isAuthenticated: isAuthenticated.value,
      user: user.value,
      walletAddress: walletAddress.value,
      walletBalance: walletBalance.value
    })
  }, 5000)
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(statusInterval)
  })
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.test-sync {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
}

.debug-panel, .action-panel, .log-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.debug-panel h3, .action-panel h3, .log-panel h3 {
  margin-top: 0;
  color: #495057;
  font-size: 20px;
  margin-bottom: 15px;
}

.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.debug-card {
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.debug-card h4 {
  margin-top: 0;
  color: #343a40;
  font-size: 16px;
  margin-bottom: 10px;
}

.debug-card p {
  margin: 8px 0;
  font-size: 14px;
  word-break: break-all;
  color: #2d3748;
}

.debug-card strong {
  color: #1a202c;
  min-width: 80px;
  display: inline-block;
  font-weight: 600;
}

.user-raw-data {
  background: #f0f4f8;
  color: #2d3748;
  padding: 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  border: 1px solid #cbd5e0;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-small {
  background: #6c757d;
  color: white;
  padding: 8px 16px;
  font-size: 12px;
}

.btn-success {
  background: #28a745;
  color: white;
}

.log-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #e9ecef;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry .timestamp {
  color: #6c757d;
  font-size: 11px;
  min-width: 80px;
}

.log-entry .message {
  flex: 1;
  margin-left: 15px;
  word-break: break-all;
}

.log-entry.success {
  color: #28a745;
}

.log-entry.error {
  color: #dc3545;
}

.log-entry.info {
  color: #17a2b8;
}

.log-entry.warning {
  color: #ffc107;
}

.no-logs {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

@media (max-width: 768px) {
  .debug-grid {
    grid-template-columns: 1fr;
  }
  
  .button-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>