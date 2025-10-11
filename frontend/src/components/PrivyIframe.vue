<template>
  <div 
    v-show="showIframe" 
    class="privy-iframe-container"
    @click="handleBackdropClick"
  >
    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      class="privy-iframe"
      frameborder="0"
      allowtransparency="true"
      @load="onIframeLoad"
    ></iframe>
    
    <!-- 调试信息 -->
    <div v-if="showDebug" class="debug-info">
      iframe显示状态: {{ showIframe ? '显示' : '隐藏' }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePrivy } from '../contexts/PrivyContext.js'

export default {
  name: 'PrivyIframe',
  emits: ['iframe-ready'],
  setup(props, { emit }) {
    const iframeRef = ref(null)
    const iframeSrc = ref('http://localhost:3001/')
    const showDebug = ref(true) // 开发模式下显示调试信息
    
    // 获取Privy上下文
    const privyContext = usePrivy()
    const showIframe = ref(false)
    
    // 监听showIframe状态变化
    if (privyContext) {
      showIframe.value = privyContext.showIframe.value
      
      // 使用Vue的watch函数监听showIframe状态变化
      const unwatch = watch(() => privyContext.showIframe.value, (newVal) => {
        showIframe.value = newVal
        console.log('iframe显示状态变化:', newVal)
      })
      
      onUnmounted(() => {
        unwatch()
      })
    }
    
    const onIframeLoad = () => {
      console.log('Privy iframe加载完成')
      emit('iframe-ready', iframeRef.value)
    }
    
    const handleBackdropClick = (event) => {
      // 点击背景区域关闭iframe
      if (event.target === event.currentTarget) {
        console.log('点击背景，关闭iframe')
        if (privyContext) {
          privyContext.hidePrivyIframe()
        }
      }
    }
    
    onMounted(() => {
      console.log('PrivyIframe组件已挂载，当前显示状态:', showIframe.value)
    })
    
    onUnmounted(() => {
      console.log('PrivyIframe组件已卸载')
    })
    
    return {
      iframeRef,
      iframeSrc,
      showIframe,
      showDebug,
      onIframeLoad,
      handleBackdropClick
    }
  }
}
</script>

<style scoped>
.privy-iframe-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.privy-iframe {
  width: 90%;
  max-width: 500px;
  height: 70%;
  max-height: 600px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.debug-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10000;
}
</style>