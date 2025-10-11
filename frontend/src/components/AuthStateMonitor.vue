<template>
  <div class="auth-monitor">
    <div class="monitor-header">
      <h4>🔍 认证状态监听器</h4>
      <span class="status-indicator" :class="{ active: isListening }">
        {{ isListening ? '监听中' : '未监听' }}
      </span>
    </div>
    
    <div class="monitor-content">
      <div class="state-item">
        <span class="label">认证状态:</span>
        <span class="value" :class="{ authenticated: isAuthenticated }">
          {{ isAuthenticated ? '已认证 ✅' : '未认证 ❌' }}
        </span>
      </div>
      
      <div class="state-item">
        <span class="label">用户信息:</span>
        <span class="value">{{ user ? user.email || user.wallet || '已设置' : '无' }}</span>
      </div>
      
      <div class="state-item">
        <span class="label">钱包地址:</span>
        <span class="value">{{ walletAddress ? truncateAddress(walletAddress) : '无' }}</span>
      </div>
      
      <div class="state-item">
        <span class="label">钱包余额:</span>
        <span class="value">{{ walletBalance || '0' }} ETH</span>
      </div>
      
      <div class="state-item">
        <span class="label">iframe状态:</span>
        <span class="value">{{ showIframe ? '显示 👁️' : '隐藏 🙈' }}</span>
      </div>
      
      <div class="state-item">
        <span class="label">最后更新:</span>
        <span class="value">{{ lastUpdate || '从未' }}</span>
      </div>
    </div>
    
    <div class="monitor-actions">
      <button @click="forceSync" class="btn-sync">🔄 强制同步</button>
      <button @click="clearState" class="btn-clear">🗑️ 清除状态</button>
      <button @click="testLogin" class="btn-test">🧪 测试登录</button>
    </div>
    
    <div class="monitor-log" v-if="logMessages.length > 0">
      <h5>📋 事件日志:</h5>
      <div class="log-entry" v-for="(log, index) in logMessages" :key="index" :class="log.type">
        <span class="timestamp">{{ log.timestamp }}</span>
        <span class="message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePrivy } from '../contexts/PrivyContext'

const {
  ready,
  isAuthenticated,
  user,
  walletAddress,
  walletBalance,
  showIframe,
  loginWithPrivy,
  logoutWithPrivy,
  manualSync
} = usePrivy()

const isListening = ref(true)
const lastUpdate = ref('')
const logMessages = ref([])

// 监听所有状态变化
watch([isAuthenticated, user, walletAddress, walletBalance, showIframe], () => {
  updateLastUpdateTime()
  addLog('状态变化检测', 'info')
}, { deep: true })

// 监听ready状态
watch(ready, (newVal) => {
  if (newVal) {
    addLog('Privy已就绪', 'success')
  }
})

const truncateAddress = (address) => {
  if (!address) return '无'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const updateLastUpdateTime = () => {
  lastUpdate.value = new Date().toLocaleTimeString()
}

const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logMessages.value.unshift({ timestamp, message, type })
  
  // 保持最多10条日志
  if (logMessages.value.length > 10) {
    logMessages.value = logMessages.value.slice(0, 10)
  }
}

const forceSync = async () => {
  addLog('开始强制同步状态', 'info')
  try {
    manualSync()
    addLog('状态同步请求已发送', 'success')
    
    // 等待1秒后检查状态
    setTimeout(() => {
      addLog(`同步后状态: ${isAuthenticated.value ? '已认证' : '未认证'}`, 'info')
    }, 1000)
  } catch (error) {
    addLog(`同步失败: ${error.message}`, 'error')
  }
}

const clearState = async () => {
  addLog('开始清除状态', 'warning')
  try {
    await logoutWithPrivy()
    addLog('状态已清除', 'success')
  } catch (error) {
    addLog(`清除失败: ${error.message}`, 'error')
  }
}

const testLogin = async () => {
  addLog('开始测试登录', 'info')
  try {
    await loginWithPrivy()
    addLog('登录请求已发送', 'success')
  } catch (error) {
    addLog(`登录失败: ${error.message}`, 'error')
  }
}

// 监听消息事件
const handleMessage = (event) => {
  if (event.origin !== 'http://localhost:3001') return
  
  switch (event.data.type) {
    case 'PRIVY_AUTH_STATE':
      addLog(`收到认证状态: ${event.data.authenticated ? '已认证' : '未认证'}`, 'info')
      break
    case 'PRIVY_LOGIN_SUCCESS':
      addLog('收到登录成功消息', 'success')
      break
    case 'PRIVY_LOGOUT_SUCCESS':
      addLog('收到登出成功消息', 'success')
      break
    default:
      addLog(`收到未知消息类型: ${event.data.type}`, 'warning')
  }
}

onMounted(() => {
  addLog('认证状态监听器已启动', 'success')
  window.addEventListener('message', handleMessage)
  updateLastUpdateTime()
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.auth-monitor {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.monitor-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.monitor-content {
  margin-bottom: 20px;
}

.state-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.state-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  opacity: 0.8;
}

.value {
  font-weight: 600;
  text-align: right;
}

.value.authenticated {
  color: #4CAF50;
}

.monitor-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.monitor-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-sync {
  background: #4CAF50;
  color: white;
}

.btn-sync:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.btn-clear {
  background: #f44336;
  color: white;
}

.btn-clear:hover {
  background: #da190b;
  transform: translateY(-1px);
}

.btn-test {
  background: #FF9800;
  color: white;
}

.btn-test:hover {
  background: #e68900;
  transform: translateY(-1px);
}

.monitor-log {
  background: rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.monitor-log h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
}

.log-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry .timestamp {
  opacity: 0.7;
  font-size: 11px;
}

.log-entry .message {
  flex: 1;
  text-align: right;
  margin-left: 10px;
}

.log-entry.success {
  color: #4CAF50;
}

.log-entry.error {
  color: #f44336;
}

.log-entry.warning {
  color: #FF9800;
}

.log-entry.info {
  color: #2196F3;
}
</style>