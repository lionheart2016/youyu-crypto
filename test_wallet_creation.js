// 创建钱包测试脚本
// 用于调试创建钱包功能

console.log('🧪 开始创建钱包测试...')

// 监听所有消息事件
function setupMessageListener() {
  console.log('📡 设置消息监听器...')
  
  window.addEventListener('message', (event) => {
    console.log('📨 收到消息:', {
      origin: event.origin,
      data: event.data,
      timestamp: new Date().toISOString()
    })
    
    // 特别关注钱包相关的消息
    if (event.data.type === 'WALLET_CREATED') {
      console.log('✅ 钱包创建成功消息:', event.data.wallet)
    } else if (event.data.type === 'PRIVY_ERROR') {
      console.log('❌ Privy错误:', event.data.error)
    } else if (event.data.type === 'CREATE_WALLET_REQUEST') {
      console.log('📤 发送创建钱包请求...')
    }
  })
}

// 检查iframe状态
function checkIframeStatus() {
  console.log('🔍 检查iframe状态...')
  
  const iframe = document.querySelector('iframe[src*="3001"]')
  if (iframe) {
    console.log('✅ 找到React iframe:', {
      src: iframe.src,
      loaded: iframe.contentDocument ? '已加载' : '加载中',
      readyState: iframe.readyState
    })
    
    // 检查contentWindow是否可用
    try {
      if (iframe.contentWindow) {
        console.log('✅ iframe contentWindow 可用')
        return true
      } else {
        console.log('❌ iframe contentWindow 不可用')
        return false
      }
    } catch (error) {
      console.log('❌ 访问iframe出错:', error)
      return false
    }
  } else {
    console.log('❌ 未找到React iframe')
    return false
  }
}

// 手动触发创建钱包
function manualCreateWallet() {
  console.log('🚀 手动触发创建钱包...')
  
  const iframe = document.querySelector('iframe[src*="3001"]')
  if (iframe && iframe.contentWindow) {
    console.log('📤 发送CREATE_WALLET_REQUEST消息...')
    iframe.contentWindow.postMessage({
      type: 'CREATE_WALLET_REQUEST',
      timestamp: Date.now()
    }, 'http://localhost:3001')
    
    console.log('✅ 创建钱包请求已发送')
  } else {
    console.log('❌ 无法发送创建钱包请求 - iframe不可用')
  }
}

// 检查Vue应用状态
function checkVueAppState() {
  console.log('🔍 检查Vue应用状态...')
  
  // 检查是否有Vue实例
  const appElement = document.querySelector('#app')
  if (appElement) {
    console.log('✅ 找到Vue应用元素')
    
    // 尝试访问Vue的全局属性
    if (window.Vue) {
      console.log('✅ Vue全局对象存在')
    } else {
      console.log('❌ Vue全局对象不存在')
    }
  } else {
    console.log('❌ 未找到Vue应用元素')
  }
}

// 检查PrivyContext状态
function checkPrivyContext() {
  console.log('🔍 检查PrivyContext状态...')
  
  // 尝试找到相关的DOM元素
  const walletElements = document.querySelectorAll('[class*="wallet"], [id*="wallet"]')
  console.log(`找到 ${walletElements.length} 个钱包相关元素`)
  
  walletElements.forEach((element, index) => {
    console.log(`元素 ${index}:`, {
      tag: element.tagName,
      class: element.className,
      id: element.id,
      text: element.textContent?.slice(0, 100)
    })
  })
}

// 完整测试流程
async function runFullTest() {
  console.log('🎯 开始完整创建钱包测试流程...')
  
  // 1. 设置监听器
  setupMessageListener()
  
  // 2. 等待页面加载
  console.log('⏳ 等待页面加载...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 3. 检查iframe状态
  const iframeReady = checkIframeStatus()
  
  // 4. 检查Vue状态
  checkVueAppState()
  checkPrivyContext()
  
  // 5. 如果iframe就绪，尝试创建钱包
  if (iframeReady) {
    console.log('🔄 iframe就绪，尝试创建钱包...')
    
    // 等待用户交互或延迟后自动触发
    console.log('💡 请在3秒内点击创建钱包按钮，或等待自动触发...')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 自动触发创建钱包
    manualCreateWallet()
    
    // 等待响应
    console.log('⏳ 等待创建钱包响应...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log('✅ 测试完成')
  } else {
    console.log('❌ iframe未就绪，跳过创建钱包测试')
  }
}

// 导出测试函数
window.walletTest = {
  setupMessageListener,
  checkIframeStatus,
  manualCreateWallet,
  checkVueAppState,
  checkPrivyContext,
  runFullTest,
  
  // 快捷命令
  quickTest: () => {
    console.log('⚡ 快速测试创建钱包功能...')
    setupMessageListener()
    checkIframeStatus()
    
    setTimeout(() => {
      manualCreateWallet()
    }, 1000)
  }
}

console.log('✅ 创建钱包测试脚本已加载')
console.log('💡 可用命令:')
console.log('  - walletTest.runFullTest() - 运行完整测试')
console.log('  - walletTest.quickTest() - 快速测试')
console.log('  - walletTest.manualCreateWallet() - 手动创建钱包')
console.log('  - walletTest.checkIframeStatus() - 检查iframe状态')

// 自动运行基础检查
setTimeout(() => {
  console.log('🔄 自动运行基础检查...')
  setupMessageListener()
  checkIframeStatus()
}, 1000)