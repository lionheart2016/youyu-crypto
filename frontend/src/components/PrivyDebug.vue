<template>
  <div class="privy-debug">
    <h3>Privy认证调试信息</h3>
    
    <div class="debug-section">
      <h4>认证状态</h4>
      <p><strong>已认证:</strong> {{ isAuthenticated ? '是' : '否' }}</p>
      <p><strong>用户信息:</strong> {{ user ? JSON.stringify(user, null, 2) : '无' }}</p>
      <p><strong>钱包地址:</strong> {{ walletAddress || '无' }}</p>
      <p><strong>iframe显示状态:</strong> {{ showIframe ? '显示' : '隐藏' }}</p>
    </div>
    
    <div class="debug-section">
      <h4>操作</h4>
      <button @click="login" class="btn-primary">测试登录</button>
      <button @click="logout" class="btn-secondary">测试登出</button>
      <button @click="toggleIframe" class="btn-info">{{ showIframe ? '隐藏' : '显示' }} iframe</button>
    </div>
    
    <div class="debug-section">
      <h4>调试信息</h4>
      <p><strong>Privy就绪:</strong> {{ ready ? '是' : '否' }}</p>
      <p><strong>加载中:</strong> {{ loading ? '是' : '否' }}</p>
      <p><strong>错误信息:</strong> {{ error || '无' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePrivy } from '../contexts/PrivyContext'

const {
  ready,
  isAuthenticated,
  user,
  walletAddress,
  loading,
  error,
  showIframe,
  loginWithPrivy,
  logoutWithPrivy,
  showPrivyIframe,
  hidePrivyIframe
} = usePrivy()

const login = async () => {
  console.log('开始登录测试')
  await loginWithPrivy()
}

const logout = async () => {
  console.log('开始登出测试')
  await logoutWithPrivy()
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
})
</script>

<style scoped>
.privy-debug {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.debug-section p {
  margin: 5px 0;
  font-family: monospace;
  font-size: 14px;
}

.btn-primary, .btn-secondary, .btn-info {
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-info { background: #17a2b8; color: white; }

.btn-primary:hover { background: #0056b3; }
.btn-secondary:hover { background: #545b62; }
.btn-info:hover { background: #138496; }
</style>