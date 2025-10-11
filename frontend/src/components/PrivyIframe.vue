<template>
  <div class="privy-iframe-container">
    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      class="privy-iframe"
      frameborder="0"
      allowtransparency="true"
      @load="onIframeLoad"
    ></iframe>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'PrivyIframe',
  emits: ['iframe-ready'],
  setup(props, { emit }) {
    const iframeRef = ref(null)
    const iframeSrc = ref('http://localhost:3001/')
    
    const onIframeLoad = () => {
      console.log('Privy iframe加载完成')
      emit('iframe-ready', iframeRef.value)
    }
    
    onMounted(() => {
      console.log('PrivyIframe组件已挂载')
    })
    
    onUnmounted(() => {
      console.log('PrivyIframe组件已卸载')
    })
    
    return {
      iframeRef,
      iframeSrc,
      onIframeLoad
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
</style>