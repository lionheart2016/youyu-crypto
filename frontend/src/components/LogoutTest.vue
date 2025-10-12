<template>
  <div class="logout-test">
    <h2>登出状态同步测试</h2>
    
    <div class="status-panel">
      <h3>当前认证状态</h3>
      <div class="status-item">
        <span>认证状态:</span>
        <span :class="{ 'authenticated': isAuthenticated, 'unauthenticated': !isAuthenticated }">
          {{ isAuthenticated ? '已认证' : '未认证' }}
        </span>
      </div>
      <div class="status-item">
        <span>用户:</span>
        <span>{{ user?.name || '无' }}</span>
      </div>
      <div class="status-item">
        <span>钱包地址:</span>
        <span>{{ walletAddress || '无' }}</span>
      </div>
    </div>

    <div class="test-actions">
      <button @click="testLogin" :disabled="isAuthenticated">测试登录</button>
      <button @click="testLogout" :disabled="!isAuthenticated">测试登出</button>
      <button @click="forceSync">强制同步状态</button>
      <button @click="clearLogs">清除日志</button>
    </div>

    <div class="logs-panel">
      <h3>测试日志</h3>
      <div class="logs" ref="logsContainer">
        <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
          <span class="timestamp">{{ log.timestamp }}</span>
          <span class="message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { usePrivy } from '../contexts/PrivyContext.js'

const { 
  isAuthenticated, 
  user, 
  walletAddress, 
  loginWithPrivy, 
  logoutWithPrivy,
  manualSync,
  iframeRef
} = usePrivy()

const logs = ref([])
const logsContainer = ref(null)

const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ timestamp, message, type })
  
  // 自动滚动到底部
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const testLogin = async () => {
  try {
    addLog('开始测试登录...', 'info')
    await loginWithPrivy('wallet')
    addLog('登录请求已发送，等待响应...', 'info')
  } catch (error) {
    addLog(`登录失败: ${error.message}`, 'error')
  }
}

const testLogout = async () => {
  try {
    addLog('开始测试登出...', 'info')
    addLog('发送LOGOUT_REQUEST到React应用', 'info')
    await logoutWithPrivy()
    addLog('登出请求已发送，等待React应用响应...', 'info')
  } catch (error) {
    addLog(`登出失败: ${error.message}`, 'error')
  }
}

const forceSync = () => {
  addLog('强制同步认证状态...', 'info')
  manualSync()
}

// 监听认证状态变化
let unwatchFns = []

onMounted(() => {
  addLog('登出测试组件已挂载', 'info')
  addLog(`当前认证状态: ${isAuthenticated.value ? '已认证' : '未认证'}`, 'info')
  
  // 监听状态变化
  const stopWatchingAuth = watch(isAuthenticated, (newVal, oldVal) => {
    addLog(`认证状态变化: ${oldVal ? '已认证' : '未认证'} → ${newVal ? '已认证' : '未认证'}`, 'info')
  })
  
  const stopWatchingUser = watch(user, (newVal, oldVal) => {
    if (newVal) {
      addLog(`用户信息更新: ${newVal.name || newVal.email}`, 'info')
    } else {
      addLog('用户信息已清空', 'info')
    }
  })
  
  const stopWatchingWallet = watch(walletAddress, (newVal, oldVal) => {
    if (newVal) {
      addLog(`钱包地址更新: ${newVal}`, 'info')
    } else {
      addLog('钱包地址已清空', 'info')
    }
  })
  
  unwatchFns = [stopWatchingAuth, stopWatchingUser, stopWatchingWallet]
})

onUnmounted(() => {
  unwatchFns.forEach(fn => fn())
})
</script>

<style scoped>
.logout-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.status-panel {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.authenticated {
  color: #4caf50;
  font-weight: bold;
}

.unauthenticated {
  color: #f44336;
  font-weight: bold;
}

.test-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.test-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #2196f3;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.test-actions button:hover:not(:disabled) {
  background: #1976d2;
}

.test-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.logs-panel {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
}

.logs {
  max-height: 300px;
  overflow-y: auto;
  background: white;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  display: flex;
  margin-bottom: 5px;
  padding: 2px 0;
}

.timestamp {
  color: #666;
  margin-right: 10px;
  min-width: 80px;
}

.message {
  flex: 1;
}

.log-item.info .message {
  color: #333;
}

.log-item.error .message {
  color: #f44336;
}

.log-item.success .message {
  color: #4caf50;
}
</style>