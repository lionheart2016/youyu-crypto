// 外部钱包连接功能测试脚本
// 这个脚本用于测试react-privy-app的外部钱包连接功能

// 测试消息类型
const testMessages = {
  // 测试连接外部钱包
  connectExternalWallet: (walletType = 'metamask') => {
    console.log(`📤 发送连接外部钱包请求: ${walletType}`);
    window.parent.postMessage({
      type: 'CONNECT_EXTERNAL_WALLET',
      walletType: walletType
    }, '*');
  },
  
  // 测试打开登录模态框
  openLoginModal: (method = 'wallet') => {
    console.log(`📤 发送打开登录模态框请求: ${method}`);
    window.parent.postMessage({
      type: 'OPEN_LOGIN_MODAL',
      method: method
    }, '*');
  },
  
  // 测试同步认证状态
  syncAuthState: () => {
    console.log('📤 发送同步认证状态请求');
    window.parent.postMessage({
      type: 'SYNC_AUTH_STATE'
    }, '*');
  },
  
  // 测试创建钱包
  createWallet: () => {
    console.log('📤 发送创建钱包请求');
    window.parent.postMessage({
      type: 'CREATE_WALLET_REQUEST'
    }, '*');
  },
  
  // 测试登出
  logout: () => {
    console.log('📤 发送登出请求');
    window.parent.postMessage({
      type: 'LOGOUT_REQUEST'
    }, '*');
  }
};

// 监听来自iframe的消息
window.addEventListener('message', (event) => {
  console.log('📥 收到来自iframe的消息:', event.data);
  
  switch (event.data.type) {
    case 'PRIVY_AUTH_STATE':
      console.log('🔐 认证状态:', event.data.authenticated ? '已认证' : '未认证');
      if (event.data.authenticated) {
        console.log('👤 用户信息:', event.data.user);
      }
      break;
      
    case 'WALLET_CREATED':
      console.log('✅ 钱包创建成功:', event.data.wallet);
      break;
      
    case 'EXTERNAL_WALLET_CONNECTED':
      console.log('🌐 外部钱包连接成功:', event.data.wallet);
      break;
      
    case 'PRIVY_ERROR':
      console.error('❌ 发生错误:', event.data.error);
      break;
      
    default:
      console.log('📨 未知消息类型:', event.data.type);
  }
});

// 创建测试界面
function createTestInterface() {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: white;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 15px;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  container.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #3b82f6;">🧪 钱包连接测试</h3>
    
    <div style="display: grid; gap: 8px;">
      <button onclick="testMessages.openLoginModal('wallet')" style="padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔗 连接钱包
      </button>
      
      <button onclick="testMessages.openLoginModal('google')" style="padding: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔐 Google登录
      </button>
      
      <button onclick="testMessages.openLoginModal('email')" style="padding: 8px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
        📧 邮箱登录
      </button>
      
      <div style="border-top: 1px solid #e5e7eb; margin: 10px 0; padding-top: 10px;">
        <strong style="color: #666; font-size: 12px;">外部钱包测试</strong>
      </div>
      
      <button onclick="testMessages.connectExternalWallet('metamask')" style="padding: 8px; background: #f97316; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🦊 MetaMask
      </button>
      
      <button onclick="testMessages.connectExternalWallet('coinbase-wallet')" style="padding: 8px; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer;">
        💰 Coinbase
      </button>
      
      <button onclick="testMessages.connectExternalWallet('wallet-connect')" style="padding: 8px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔗 WalletConnect
      </button>
      
      <button onclick="testMessages.createWallet()" style="padding: 8px; background: #ec4899; color: white; border: none; border-radius: 4px; cursor: pointer;">
        💳 创建钱包
      </button>
      
      <button onclick="testMessages.syncAuthState()" style="padding: 8px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔄 同步状态
      </button>
      
      <button onclick="testMessages.logout()" style="padding: 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🚪 登出
      </button>
    </div>
    
    <div style="margin-top: 10px; font-size: 11px; color: #666;">
      查看控制台获取详细日志
    </div>
  `;
  
  document.body.appendChild(container);
}

// 页面加载完成后创建测试界面
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(createTestInterface, 1000);
});

// 导出测试函数供控制台使用
window.testExternalWallet = testMessages;