// 状态同步测试工具
export const testMessageCommunication = () => {
  console.log('🧪 开始测试消息通信...')
  
  // 测试向React应用发送消息
  const testIframeMessage = () => {
    const iframes = document.querySelectorAll('iframe')
    console.log(`找到 ${iframes.length} 个iframe`)
    
    iframes.forEach((iframe, index) => {
      console.log(`iframe ${index}:`, {
        src: iframe.src,
        loaded: iframe.contentWindow ? '已加载' : '未加载'
      })
      
      if (iframe.contentWindow) {
        try {
          // 发送测试消息
          iframe.contentWindow.postMessage({
            type: 'TEST_MESSAGE',
            timestamp: Date.now(),
            message: '来自前端的测试消息'
          }, 'http://localhost:3001')
          
          console.log(`✅ 已向iframe ${index} 发送测试消息`)
        } catch (error) {
          console.error(`❌ 向iframe ${index} 发送消息失败:`, error)
        }
      }
    })
  }
  
  // 监听来自React应用的消息
  const setupMessageListener = () => {
    const handleMessage = (event) => {
      if (event.origin !== 'http://localhost:3001') return
      
      console.log('📨 收到来自React应用的消息:', {
        type: event.data.type,
        data: event.data,
        timestamp: new Date().toLocaleTimeString()
      })
    }
    
    window.addEventListener('message', handleMessage)
    console.log('👂 已设置消息监听器')
    
    // 返回清理函数
    return () => {
      window.removeEventListener('message', handleMessage)
      console.log('🧹 已移除消息监听器')
    }
  }
  
  // 检查iframe状态
  const checkIframeStatus = () => {
    setTimeout(() => {
      const iframes = document.querySelectorAll('iframe[src*="3001"]')
      console.log(`🎯 找到 ${iframes.length} 个目标iframe (端口3001)`)
      
      iframes.forEach((iframe, index) => {
        console.log(`📊 iframe ${index} 状态:`, {
          src: iframe.src,
          loaded: iframe.contentWindow ? '已加载' : '未加载',
          visible: iframe.style.display !== 'none' ? '可见' : '隐藏'
        })
      })
    }, 2000) // 等待2秒让iframe加载
  }
  
  // 执行测试
  console.log('🚀 开始执行测试序列...')
  const cleanup = setupMessageListener()
  checkIframeStatus()
  
  // 延迟发送测试消息
  setTimeout(() => {
    testIframeMessage()
  }, 3000)
  
  // 返回清理函数
  return cleanup
}

// 测试状态同步功能
export const testStateSync = () => {
  console.log('🔄 开始测试状态同步...')
  
  const testSync = () => {
    const iframes = document.querySelectorAll('iframe[src*="3001"]')
    
    iframes.forEach((iframe) => {
      if (iframe.contentWindow) {
        try {
          // 发送状态同步请求
          iframe.contentWindow.postMessage({
            type: 'SYNC_AUTH_STATE',
            timestamp: Date.now()
          }, 'http://localhost:3001')
          
          console.log('📤 已发送状态同步请求')
        } catch (error) {
          console.error('❌ 状态同步请求失败:', error)
        }
      }
    })
  }
  
  // 延迟执行同步测试
  setTimeout(testSync, 1000)
}

// 手动登录测试
export const testManualLogin = () => {
  console.log('🔑 开始手动登录测试...')
  
  const testLogin = () => {
    const iframes = document.querySelectorAll('iframe[src*="3001"]')
    
    iframes.forEach((iframe) => {
      if (iframe.contentWindow) {
        try {
          // 发送登录请求
          iframe.contentWindow.postMessage({
            type: 'OPEN_LOGIN_MODAL',
            method: 'wallet',
            timestamp: Date.now()
          }, 'http://localhost:3001')
          
          console.log('🔐 已发送登录请求')
        } catch (error) {
          console.error('❌ 登录请求失败:', error)
        }
      }
    })
  }
  
  // 延迟执行登录测试
  setTimeout(testLogin, 1000)
}

// 手动登出测试
export const testManualLogout = () => {
  console.log('🚪 开始手动登出测试...')
  
  const testLogout = () => {
    const iframes = document.querySelectorAll('iframe[src*="3001"]')
    
    iframes.forEach((iframe) => {
      if (iframe.contentWindow) {
        try {
          // 发送登出请求
          iframe.contentWindow.postMessage({
            type: 'LOGOUT_REQUEST',
            timestamp: Date.now()
          }, 'http://localhost:3001')
          
          console.log('🚪 已发送登出请求')
        } catch (error) {
          console.error('❌ 登出请求失败:', error)
        }
      }
    })
  }
  
  // 延迟执行登出测试
  setTimeout(testLogout, 1000)
}

// 导出所有测试函数到全局作用域
if (typeof window !== 'undefined') {
  window.syncTest = {
    testMessageCommunication,
    testStateSync,
    testManualLogin,
    testManualLogout
  }
  
  console.log('🎯 同步测试工具已加载到 window.syncTest')
  console.log('💡 使用方法:')
  console.log('  - window.syncTest.testMessageCommunication() // 测试消息通信')
  console.log('  - window.syncTest.testStateSync() // 测试状态同步')
  console.log('  - window.syncTest.testManualLogin() // 测试手动登录')
  console.log('  - window.syncTest.testManualLogout() // 测试手动登出')
}