<template>
  <div class="privy-debug">
    <h3>Privy认证调试信息</h3>
    
    <div class="debug-section">
      <h4>认证状态</h4>
      <p><strong>已认证:</strong> {{ isAuthenticated ? '是' : '否' }}</p>
      <p><strong>用户信息:</strong> {{ user ? JSON.stringify(user, null, 2) : '无' }}</p>
      <p><strong>钱包地址:</strong> {{ walletAddress || '无' }}</p>
      <p><strong>钱包余额:</strong> {{ walletBalance || '0' }} ETH</p>
      <p><strong>iframe显示状态:</strong> {{ showIframe ? '显示' : '隐藏' }}</p>
      <p><strong>iframe引用:</strong> {{ iframeRef ? '已设置' : '未设置' }}</p>
    </div>
    
    <div class="debug-section">
      <h4>操作</h4>
      <button @click="login" class="btn-primary">测试登录</button>
      <button @click="logout" class="btn-secondary">测试登出</button>
      <button @click="syncState" class="btn-info">同步状态</button>
      <button @click="toggleIframe" class="btn-warning">{{ showIframe ? '隐藏' : '显示' }} iframe</button>
    </div>
    
    <div class="debug-section">
      <h4>调试信息</h4>
      <p><strong>Privy就绪:</strong> {{ ready ? '是' : '否' }}</p>
      <p><strong>加载中:</strong> {{ loading ? '是' : '否' }}</p>
      <p><strong>错误信息:</strong> {{ error || '无' }}</p>
      <p><strong>当前时间:</strong> {{ currentTime }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
  loginWithPrivy,
  logoutWithPrivy,
  showPrivyIframe,
  hidePrivyIframe,
  manualSync
} = usePrivy()

const currentTime = computed(() => {
  return new Date().toLocaleTimeString()
})

const iframeRef = ref(null)

const login = async () => {
  console.log('开始登录测试')
  try {
    await loginWithPrivy()
    console.log('登录测试完成')
  } catch (err) {
    console.error('登录测试失败:', err)
  }
}

const logout = async () => {
  console.log('开始登出测试')
  try {
    await logoutWithPrivy()
    console.log('登出测试完成')
  } catch (err) {
    console.error('登出测试失败:', err)
  }
}

const syncState = () => {
  console.log('手动同步状态')
  // 调用PrivyContext中的同步方法
  manualSync()
  console.log('当前状态:', {
    ready: ready.value,
    isAuthenticated: isAuthenticated.value,
    user: user.value,
    walletAddress: walletAddress.value,
    walletBalance: walletBalance.value,
    showIframe: showIframe.value
  })
}

const toggleIframe = () => {
  if (showIframe.value) {
    hidePrivyIframe()
  } else {
    showPrivyIframe()
  }
}

onMounted(() => {
  console.log('PrivyDebug组件已挂载')
  console.log('Privy上下文对象:', {
    ready,
    isAuthenticated,
    user,
    walletAddress,
    walletBalance,
    showIframe
  })
})
</script>

<style scoped>
.privy-debug {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.privy-debug h3 {
  color: #495057;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}

.debug-section {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.debug-section h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #343a40;
  font-size: 16px;
  font-weight: 600;
}

.debug-section p {
  margin: 8px 0;
  font-size: 14px;
  word-break: break-all;
  line-height: 1.4;
}

.debug-section p strong {
  color: #495057;
  min-width: 120px;
  display: inline-block;
}

.debug-section button {
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.debug-section button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
}
</style>