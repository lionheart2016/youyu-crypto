<template>
  <div class="min-h-screen bg-gray-900 relative">
    <NavBar />
    <main class="container mx-auto px-4 py-8 relative z-10">
      <router-view></router-view>
    </main>
    
    <!-- Privy iframe认证组件 -->
    <PrivyIframe 
      @iframe-ready="onIframeReady"
    />
    
    <!-- 认证状态监听器（调试用） -->
    <AuthStateMonitor />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import PrivyIframe from './components/PrivyIframe.vue'
import AuthStateMonitor from './components/AuthStateMonitor.vue'
import { createPrivyContext, providePrivy } from './contexts/PrivyContext'

const privyContext = createPrivyContext()
providePrivy(privyContext)

const ready = ref(false)

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