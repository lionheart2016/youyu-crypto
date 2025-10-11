# Privy SDK 集成指南

## 概述

本指南介绍如何在 YouyuCrypto 项目中集成 Privy SDK，实现Web3钱包连接和身份验证功能。

## 新增功能：React + Vue iframe集成方案

由于Privy官方没有提供Vue.js版本的SDK，我们实现了通过iframe嵌入React应用的方式，在Vue.js项目中集成Privy认证功能。

### 架构说明

- **Vue.js主应用** (端口3000): 主要业务逻辑和界面
- **React Privy应用** (端口3001): 通过iframe嵌入的认证界面
- **跨窗口通信**: 使用postMessage实现状态同步

## 已完成的集成

### 1. 依赖安装
- 已安装 `@privy-io/react-auth` 和 `ethers@^6`

### 2. 配置文件
- 创建了 `frontend/.env` 文件用于配置Privy应用ID
- 创建了 `frontend/src/config/privy.js` 配置文件

### 3. 上下文管理
- 创建了 `frontend/src/contexts/PrivyContext.js` 提供Vue 3的Privy上下文
- 修改了 `frontend/src/App.vue` 集成Privy上下文

### 4. 组件集成
- 创建了 `frontend/src/components/PrivyWallet.vue` 专用组件
- 修改了 `frontend/src/components/WalletConnect.vue` 支持Privy钱包连接

### 5. 状态管理
- 更新了 `frontend/src/store/walletStore.js` 支持Privy钱包类型

## 配置步骤

### 1. 获取Privy应用ID

1. 访问 [Privy Dashboard](https://dashboard.privy.io)
2. 创建新应用或选择现有应用
3. 获取应用ID和客户端ID

### 2. 配置环境变量

编辑 `frontend/.env` 文件：

```env
VITE_PRIVY_APP_ID=your_privy_app_id_here
VITE_PRIVY_CLIENT_ID=your_privy_client_id_here
```

### 3. 配置Privy设置

编辑 `frontend/src/config/privy.js` 文件：

```javascript
export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  supportedChains: [mainnet, polygon, optimism, arbitrum],
  loginMethods: ['wallet', 'email', 'sms', 'google', 'apple', 'discord'],
  appearance: {
    theme: 'light',
    accentColor: '#3B82F6',
    logo: '/logo.png'
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets'
  },
  defaultChain: mainnet
};
```

## 功能特性

### 1. 钱包支持
- **Privy**: 嵌入式钱包和社交登录

### 2. 统一界面
- 导航栏显示统一的钱包连接按钮
- 根据连接的钱包类型显示不同标识
- 支持断开连接功能

### 3. 状态管理
- 本地存储钱包连接状态
- 支持自动重连
- 钱包类型识别

## 使用方法

### 1. 连接钱包

在导航栏点击钱包连接按钮，选择Privy认证：
- **Privy**: 使用嵌入式钱包或社交登录

### 2. 使用钱包上下文

在Vue组件中使用Privy上下文：

```javascript
import { usePrivy } from '../contexts/PrivyContext.js';

export default {
  setup() {
    const {
      authenticated,
      walletAddress,
      walletBalance,
      connectWallet,
      disconnectWallet,
      sendTransaction,
      signMessage
    } = usePrivy();
    
    return {
      authenticated,
      walletAddress,
      walletBalance,
      connectWallet,
      disconnectWallet,
      sendTransaction,
      signMessage
    };
  }
};
```

### 3. 发送交易

```javascript
const sendETH = async () => {
  try {
    const transaction = {
      to: '0xRecipientAddress',
      value: ethers.parseEther('0.1'),
      gasLimit: 21000
    };
    
    const result = await sendTransaction(transaction);
    console.log('交易已发送:', result.hash);
  } catch (error) {
    console.error('发送交易失败:', error);
  }
};
```

## 开发说明

### 2. 当前实现状态
- ✅ 基础Privy上下文集成
- ✅ Privy钱包连接界面
- ✅ 状态管理和本地存储
- ⚠️ 需要配置真实的Privy应用ID
- ⚠️ 需要完善Privy SDK的实际集成

### 2. 下一步开发

1. **配置真实Privy应用**
   - 在Privy Dashboard创建应用
   - 配置回调URL和域名白名单

2. **完善Privy集成**
   - 实现实际的Privy SDK集成
   - 添加社交登录功能
   - 实现嵌入式钱包管理

3. **测试和优化**
   - 测试各种登录方式
   - 优化用户体验
   - 添加错误处理

## 故障排除

### 常见问题

1. **Privy应用ID未配置**
   - 症状: 连接Privy钱包失败
   - 解决: 检查 `.env` 文件中的 `VITE_PRIVY_APP_ID` 配置

2. **CORS错误**
   - 症状: 跨域请求被阻止
   - 解决: 在Privy Dashboard配置正确的域名白名单

3. **钱包连接失败**
   - 症状: 连接按钮无响应
   - 解决: 检查浏览器控制台错误信息，确认Privy SDK加载正常

### 调试技巧

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 检查Network标签页的API请求
4. 确认环境变量是否正确加载

## 相关文件

- `frontend/.env` - 环境变量配置
- `frontend/src/config/privy.js` - Privy配置
- `frontend/src/contexts/PrivyContext.js` - Privy上下文
- `frontend/src/components/PrivyWallet.vue` - Privy钱包组件
- `frontend/src/components/WalletConnect.vue` - 钱包连接组件
- `frontend/src/store/walletStore.js` - 钱包状态管理

## React + Vue iframe集成方案

### 项目结构

```
├── frontend/                 # Vue.js主应用 (端口3000)
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivyIframe.vue    # iframe容器组件
│   │   ├── contexts/
│   │   │   └── PrivyContext.js    # Privy认证上下文
│   │   └── App.vue                 # 主应用，包含iframe
│   └── package.json
├── react-privy-app/          # React Privy认证应用 (端口3001)
│   ├── src/
│   │   └── App.jsx                 # Privy认证组件
│   └── package.json
```

### 快速开始

```bash
# 启动React Privy认证应用 (端口3001)
cd react-privy-app
npm install
npm run dev

# 启动Vue.js主应用 (端口3000)
cd ../frontend
npm install
npm run dev
```

### 功能特性

- ✅ 通过iframe嵌入React应用实现Privy认证
- ✅ 支持钱包连接、Google登录、邮箱登录
- ✅ 实时认证状态同步
- ✅ 跨窗口安全通信
- ✅ 演示模式（无需真实Privy应用ID）

### 配置真实Privy应用

1. 在 `react-privy-app/.env` 文件中设置：
   ```env
   VITE_PRIVY_APP_ID=您的实际Privy应用ID
   ```

2. 重启React应用

### 通信协议

```javascript
// Vue → React
iframe.contentWindow.postMessage({
  type: 'OPEN_LOGIN_MODAL'
}, 'http://localhost:3001')

// React → Vue
window.parent.postMessage({
  type: 'PRIVY_AUTH_STATE',
  authenticated: true,
  user: userInfo
}, '*')
```

## 参考资料

- [Privy官方文档](https://docs.privy.io)
- [Privy Dashboard](https://dashboard.privy.io)
- [Vue 3 Composition API](https://vuejs.org/guide/introduction.html)
- [Ethers.js文档](https://docs.ethers.org/v6/)

---

如有问题，请查看浏览器控制台错误信息或联系开发团队。