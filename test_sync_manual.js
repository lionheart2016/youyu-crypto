// 状态同步测试脚本
// 用于验证Vue和React应用之间的状态同步功能

console.log('🧪 开始状态同步测试...')

// 测试消息通信
function testMessageCommunication() {
  console.log('📡 测试消息通信...')
  
  // 监听消息
  window.addEventListener('message', (event) => {
    console.log('📨 收到消息:', event.data)
    
    if (event.data.type === 'PRIVY_AUTH_STATE') {
      console.log('🔐 认证状态消息:', {
        authenticated: event.data.authenticated,
        user: event.data.user
      })
    }
  })
  
  // 发送测试消息
  setTimeout(() => {
    console.log('📤 发送同步请求...')
    const iframe = document.querySelector('iframe[src*="3001"]')
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'SYNC_AUTH_STATE',
        timestamp: Date.now()
      }, 'http://localhost:3001')
      console.log('✅ 同步请求已发送')
    } else {
      console.log('❌ 未找到iframe')
    }
  }, 2000)
}

// 测试登出流程
function testLogoutFlow() {
  console.log('🚪 测试登出流程...')
  
  // 监听登出相关消息
  window.addEventListener('message', (event) => {
    if (event.data.type === 'PRIVY_AUTH_STATE' && !event.data.authenticated) {
      console.log('✅ 收到登出确认 - 用户已登出')
    }
  })
  
  // 触发登出
  setTimeout(() => {
    console.log('🔄 触发登出...')
    const logoutButton = document.querySelector('button:contains("登出")')
    if (logoutButton) {
      logoutButton.click()
      console.log('✅ 登出按钮已点击')
    } else {
      console.log('❌ 未找到登出按钮')
    }
  }, 3000)
}

// 检查当前状态
function checkCurrentAuthState() {
  console.log('🔍 检查当前认证状态...')
  
  // 检查Vue应用中的状态
  const vueApp = document.querySelector('#app')
  if (vueApp && vueApp.__vue_app__) {
    const vm = vueApp.__vue_app__.config.globalProperties
    console.log('Vue应用状态:', {
      isAuthenticated: vm.$isAuthenticated,
      user: vm.$user,
      walletAddress: vm.$walletAddress
    })
  }
  
  // 检查iframe状态
  const iframe = document.querySelector('iframe[src*="3001"]')
  if (iframe) {
    console.log('✅ React iframe已找到')
    console.log('iframe src:', iframe.src)
    console.log('iframe加载状态:', iframe.contentDocument ? '已加载' : '加载中')
  } else {
    console.log('❌ 未找到React iframe')
  }
}

// 运行测试
console.log('🚀 启动状态同步测试...')
checkCurrentAuthState()
testMessageCommunication()

// 导出测试函数供手动调用
window.syncTest = {
  testMessageCommunication,
  testLogoutFlow,
  checkCurrentAuthState,
  
  // 手动触发登出
  triggerLogout: () => {
    const iframe = document.querySelector('iframe[src*="3001"]')
    if (iframe && iframe.contentWindow) {
      console.log('📤 手动发送登出请求...')
      iframe.contentWindow.postMessage({
        type: 'LOGOUT_REQUEST'
      }, 'http://localhost:3001')
    }
  },
  
  // 手动触发状态同步
  triggerSync: () => {
    const iframe = document.querySelector('iframe[src*="3001"]')
    if (iframe && iframe.contentWindow) {
      console.log('📤 手动发送同步请求...')
      iframe.contentWindow.postMessage({
        type: 'SYNC_AUTH_STATE',
        timestamp: Date.now()
      }, 'http://localhost:3001')
    }
  }
}

console.log('✅ 测试脚本已加载')
console.log('💡 可用命令:')
console.log('  - syncTest.checkCurrentAuthState() - 检查当前状态')
console.log('  - syncTest.testMessageCommunication() - 测试消息通信')
console.log('  - syncTest.triggerLogout() - 手动触发登出')
console.log('  - syncTest.triggerSync() - 手动触发同步')