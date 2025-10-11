<template>
  <div class="min-h-screen bg-gray-900 relative">
    <NavBar />
    <main class="container mx-auto px-4 py-8 relative z-10">
      <router-view></router-view>
    </main>
    
    <!-- Privy iframe认证组件 -->
    <PrivyIframe 
      v-if="privyContext.showIframe"
      @iframe-ready="onIframeReady"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import NavBar from './components/NavBar.vue'
import PrivyIframe from './components/PrivyIframe.vue'
import { createPrivyContext, providePrivy } from './contexts/PrivyContext'

const privyContext = createPrivyContext()
providePrivy(privyContext)

const ready = ref(false)

// 监听认证状态变化，认证成功后自动隐藏iframe
watch(() => privyContext.isAuthenticated, (authenticated) => {
  if (authenticated) {
    // 认证成功后延迟隐藏iframe
    setTimeout(() => {
      privyContext.hidePrivyIframe()
    }, 1000)
  }
})

const onIframeReady = (iframeRef) => {
  console.log('Privy iframe已就绪')
  privyContext.setIframeRef(iframeRef)
}

onMounted(() => {
  console.log('App mounted, initializing Privy context')
  privyContext.initPrivy()
  ready.value = true
})
</script>