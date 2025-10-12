// 创建钱包功能详细调试脚本
// 用于诊断创建钱包过程中的问题

console.log('🔍 开始创建钱包功能调试...');

// 检查基本环境
function checkEnvironment() {
  console.log('📋 环境检查:');
  console.log('  - 当前URL:', window.location.href);
  console.log('  - 用户代理:', navigator.userAgent);
  console.log('  - 当前时间:', new Date().toLocaleString());
  
  // 检查iframe状态
  const iframes = document.querySelectorAll('iframe');
  console.log(`  - 找到 ${iframes.length} 个iframe`);
  
  iframes.forEach((iframe, index) => {
    console.log(`  - iframe ${index + 1}:`);
    console.log(`    src: ${iframe.src}`);
    console.log(`    可见性: ${iframe.style.display || '默认'}`);
    console.log(`    尺寸: ${iframe.offsetWidth}x${iframe.offsetHeight}`);
    
    // 尝试访问contentWindow
    try {
      const contentWindow = iframe.contentWindow;
      console.log(`    contentWindow: 可访问`);
      console.log(`    contentWindow.location: ${contentWindow.location.href}`);
    } catch (error) {
      console.log(`    contentWindow: 访问受限 - ${error.message}`);
    }
  });
}

// 检查认证状态
function checkAuthStatus() {
  console.log('\n🔐 认证状态检查:');
  
  // 检查Vue应用中的认证状态
  if (window.VueApp && window.VueApp.config && window.VueApp.config.globalProperties) {
    const privyContext = window.VueApp.config.globalProperties.$privyContext;
    if (privyContext) {
      console.log('  - Vue应用认证状态:', privyContext.authenticated?.value);
      console.log('  - Vue应用钱包地址:', privyContext.walletAddress?.value);
      console.log('  - Vue应用用户信息:', privyContext.user?.value);
    } else {
      console.log('  - 未找到Vue Privy上下文');
    }
  } else {
    console.log('  - 未找到Vue应用实例');
  }
  
  // 检查全局变量
  console.log('  - window.isAuthenticated:', window.isAuthenticated);
  console.log('  - window.walletAddress:', window.walletAddress);
  console.log('  - window.user:', window.user);
}

// 测试消息传递
function testMessagePassing() {
  console.log('\n📨 消息传递测试:');
  
  const targetIframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]');
  
  if (!targetIframe) {
    console.log('  ❌ 未找到目标iframe');
    return;
  }
  
  console.log('  ✅ 找到目标iframe');
  
  try {
    // 测试基本消息传递
    const testMessage = {
      type: 'TEST_MESSAGE',
      timestamp: Date.now(),
      data: 'Hello from parent'
    };
    
    targetIframe.contentWindow.postMessage(testMessage, 'http://localhost:3001');
    console.log('  ✅ 测试消息已发送:', testMessage);
    
    // 测试创建钱包请求
    setTimeout(() => {
      const createWalletMessage = {
        type: 'CREATE_WALLET_REQUEST',
        timestamp: Date.now(),
        test: true
      };
      
      targetIframe.contentWindow.postMessage(createWalletMessage, 'http://localhost:3001');
      console.log('  ✅ 创建钱包请求已发送:', createWalletMessage);
    }, 1000);
    
  } catch (error) {
    console.log('  ❌ 消息发送失败:', error.message);
  }
}

// 监听消息响应
function setupMessageListener() {
  console.log('\n👂 设置消息监听器...');
  
  const messageHandler = (event) => {
    console.log('📨 收到消息:', {
      origin: event.origin,
      type: event.data.type,
      data: event.data
    });
    
    // 特殊处理钱包创建成功消息
    if (event.data.type === 'WALLET_CREATED') {
      console.log('🎉 钱包创建成功！', event.data.wallet);
    }
    
    // 特殊处理错误消息
    if (event.data.type === 'PRIVY_ERROR') {
      console.log('❌ Privy错误:', event.data.error);
    }
  };
  
  window.addEventListener('message', messageHandler);
  console.log('  ✅ 消息监听器已设置');
  
  return () => {
    window.removeEventListener('message', messageHandler);
    console.log('  🗑️ 消息监听器已移除');
  };
}

// 模拟创建钱包流程
async function simulateWalletCreation() {
  console.log('\n🚀 模拟创建钱包流程...');
  
  // 步骤1: 检查环境
  checkEnvironment();
  
  // 步骤2: 检查认证状态
  checkAuthStatus();
  
  // 步骤3: 设置消息监听
  const removeListener = setupMessageListener();
  
  // 步骤4: 测试消息传递
  testMessagePassing();
  
  // 步骤5: 等待响应（30秒超时）
  console.log('\n⏳ 等待响应（30秒超时）...');
  
  const timeout = setTimeout(() => {
    console.log('⏰ 等待响应超时');
    removeListener();
  }, 30000);
  
  // 监听钱包创建事件
  const walletCreatedHandler = (event) => {
    console.log('🎉 收到钱包创建事件:', event.detail);
    clearTimeout(timeout);
    removeListener();
  };
  
  window.addEventListener('wallet-created', walletCreatedHandler);
  
  // 清理函数
  return () => {
    clearTimeout(timeout);
    removeListener();
    window.removeEventListener('wallet-created', walletCreatedHandler);
  };
}

// 检查Privy配置
function checkPrivyConfig() {
  console.log('\n⚙️ Privy配置检查:');
  
  // 检查React应用中的配置
  const reactIframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]');
  if (reactIframe) {
    console.log('  ✅ React iframe已找到');
    
    try {
      // 尝试获取iframe中的配置信息
      reactIframe.contentWindow.postMessage({
        type: 'GET_CONFIG',
        timestamp: Date.now()
      }, 'http://localhost:3001');
      
      console.log('  ✅ 配置请求已发送');
    } catch (error) {
      console.log('  ❌ 无法访问iframe配置:', error.message);
    }
  } else {
    console.log('  ❌ React iframe未找到');
  }
}

// 错误诊断
function diagnoseErrors() {
  console.log('\n🔧 错误诊断:');
  
  // 检查常见的错误情况
  const commonIssues = [
    {
      name: 'iframe未加载',
      check: () => !document.querySelector('iframe[src*="3001"]') && !document.querySelector('iframe[src*="3002"]'),
      message: 'React应用iframe未找到，请确保React应用正在运行'
    },
    {
      name: '跨域问题',
      check: () => {
        const iframe = document.querySelector('iframe[src*="3001"]') || document.querySelector('iframe[src*="3002"]');
        if (!iframe) return false;
        try {
          iframe.contentWindow.location.href;
          return false;
        } catch {
          return true;
        }
      },
      message: '可能存在跨域访问限制'
    },
    {
      name: '端口冲突',
      check: () => {
        const iframes = document.querySelectorAll('iframe');
        return Array.from(iframes).some(iframe => {
          const src = iframe.src;
          return src.includes('3001') || src.includes('3002');
        }) && !document.querySelector('iframe[src*="3001"]');
      },
      message: '端口可能被占用，React应用运行在备用端口'
    }
  ];
  
  commonIssues.forEach(issue => {
    if (issue.check()) {
      console.log(`  ⚠️ ${issue.name}: ${issue.message}`);
    } else {
      console.log(`  ✅ ${issue.name}: 正常`);
    }
  });
}

// 执行完整诊断
async function runFullDiagnosis() {
  console.log('🔍 开始创建钱包功能完整诊断...');
  console.log('=' .repeat(50));
  
  try {
    // 基础检查
    checkEnvironment();
    checkAuthStatus();
    diagnoseErrors();
    checkPrivyConfig();
    
    // 模拟创建流程
    await simulateWalletCreation();
    
    console.log('\n✅ 诊断完成');
    
  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error);
  }
}

// 添加一些实用的调试命令到全局作用域
window.debugWalletCreation = {
  runDiagnosis: runFullDiagnosis,
  checkEnvironment,
  checkAuthStatus,
  testMessagePassing,
  setupMessageListener,
  simulateWalletCreation,
  checkPrivyConfig,
  diagnoseErrors
};

console.log('\n💡 调试工具已准备就绪！');
console.log('可用命令:');
console.log('  - window.debugWalletCreation.runDiagnosis() - 运行完整诊断');
console.log('  - window.debugWalletCreation.checkEnvironment() - 检查环境');
console.log('  - window.debugWalletCreation.checkAuthStatus() - 检查认证状态');
console.log('  - window.debugWalletCreation.testMessagePassing() - 测试消息传递');
console.log('  - window.debugWalletCreation.simulateWalletCreation() - 模拟创建钱包');

// 如果页面已加载完成，自动运行诊断
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runFullDiagnosis);
} else {
  // 延迟2秒运行，确保所有组件都加载完成
  setTimeout(runFullDiagnosis, 2000);
}