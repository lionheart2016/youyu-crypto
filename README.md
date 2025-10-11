# YouyuCrypto - 加密货币交易平台

![YouyuCrypto Logo](https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=YouyuCrypto)

一个基于Vue3和NestJS的现代化加密货币交易Web应用，集成了Privy认证系统。

## 🆕 新增功能 - Privy认证集成

项目现已集成Privy认证系统，支持多种登录方式：
- 🔐 **钱包登录** - 连接Coinbase Wallet等
- 📧 **邮箱登录** - 通过邮箱验证码登录
- 🔗 **Google登录** - 使用Google账户快速登录
- 📱 **短信登录** - 手机号验证登录

### 技术架构
- **Vue主应用** (localhost:3000) - 主要交易界面
- **React认证应用** (localhost:3001) - 通过iframe嵌入的Privy认证界面
- **跨窗口通信** - 使用postMessage实现应用间数据同步

## 功能特性

### 前端 (Vue3)
- 🎨 现代化UI设计，使用Tailwind CSS
- 🔗 Privy钱包集成（支持多种钱包）
- 📊 实时加密货币价格展示
- 💼 交易面板（限价单/市价单）
- 📈 价格图表和订单簿
- 👛 钱包管理和资产概览
- 📱 响应式设计

### 后端 (NestJS)
- 🚀 高性能API服务
- 💾 SQLite数据库存储
- 🔐 安全的交易处理
- 📊 实时市场数据
- 💰 钱包余额管理
- 📈 交易历史记录
- 📚 Swagger API文档

## 技术栈

### 前端
- Vue 3.4.0
- Vue Router 4
- Tailwind CSS 3.3.0
- Ethers.js 6.10.0 (Web3交互)
- Vite 5.0.0 (构建工具)

### 后端
- NestJS 10.0.0
- TypeORM 0.3.17
- SQLite 5.1.6
- Swagger 7.1.10 (API文档)
- Ethers.js 6.10.0 (区块链交互)

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装和运行

1. 克隆项目
```bash
git clone <repository-url>
cd youyu-crypto
```

2. 安装前端依赖
```bash
cd frontend
npm install
```

3. 安装后端依赖
```bash
cd ../backend
npm install
```

4. 安装React认证应用依赖
```bash
cd ../react-privy-app
npm install
```

5. 配置Privy应用ID
```bash
# 复制环境变量模板
cp frontend/.env.example frontend/.env
cp react-privy-app/.env.example react-privy-app/.env

# 在.env文件中配置您的Privy应用ID
VITE_PRIVY_APP_ID=your-privy-app-id-here
```

6. 启动React认证应用（终端1）
```bash
cd react-privy-app
npm run dev
```
认证应用将在 http://localhost:3001 运行

7. 启动后端服务（终端2）
```bash
cd backend
npm run start:dev
```
后端服务将在 http://localhost:3002 运行

8. 启动前端应用（终端3）
```bash
cd frontend
npm run dev
```
前端应用将在 http://localhost:3000 运行

### 一键启动（推荐）
```bash
./start.sh
```

### 访问应用

1. 打开浏览器访问 http://localhost:3000
2. 点击"连接钱包"使用Privy认证系统
3. 选择您喜欢的登录方式（钱包、邮箱、Google等）
4. 开始交易加密货币

## API文档

启动后端服务后，访问 http://localhost:3001/api 查看完整的API文档。

## 项目结构

youyu-crypto/
├── frontend/                 # Vue3前端应用 (主应用)
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   │   ├── PrivyIframe.vue    # Privy认证iframe组件
│   │   │   ├── PrivyLogin.vue     # Privy登录组件
│   │   │   └── PrivyWallet.vue   # Privy钱包组件
│   │   ├── contexts/
│   │   │   └── PrivyContext.js    # Privy认证上下文
│   │   ├── views/           # 页面视图
│   │   ├── router/          # 路由配置
│   │   └── main.js          # 应用入口
│   ├── package.json
│   └── vite.config.js
├── react-privy-app/          # React认证应用 (iframe嵌入)
│   ├── src/
│   │   ├── App.jsx           # 主认证组件
│   │   ├── index.css         # 样式文件
│   │   └── main.jsx          # 应用入口
│   ├── package.json
│   └── vite.config.js
├── backend/                  # NestJS后端服务
│   ├── src/
│   │   ├── crypto/          # 加密货币模块
│   │   ├── trading/         # 交易模块
│   │   ├── wallet/          # 钱包模块
│   │   ├── app.module.ts    # 主模块
│   │   └── main.ts          # 应用入口
│   ├── package.json
│   └── nest-cli.json
├── PRIVY_INTEGRATION_GUIDE.md  # Privy集成指南
├── start.sh                 # 一键启动脚本
└── README.md
```

## 主要功能模块

### 加密货币模块
- 获取加密货币列表
- 实时价格数据
- 市场概览统计
- 价格历史数据

### 交易模块
- 创建买卖订单
- 订单簿管理
- 交易历史
- 订单状态跟踪

### 钱包模块
- 钱包余额管理
- 资产分布
- 交易记录
- 链上余额同步

## 开发说明

### 前端开发
```bash
cd frontend
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run preview      # 预览构建结果
```

### 后端开发
```bash
cd backend
npm run start:dev    # 开发模式（热重载）
npm run start        # 生产模式
npm run test         # 运行测试
```

## 部署说明

### 前端部署
构建静态文件并部署到Web服务器：
```bash
cd frontend
npm run build
# 将dist目录部署到Web服务器
```

### 后端部署
构建并运行生产版本：
```bash
cd backend
npm run build
npm run start:prod
```

## 注意事项

1. **MetaMask连接**: 确保使用支持以太坊的浏览器（Chrome、Firefox等）
2. **测试网络**: 建议在测试网络（如Goerli）进行测试交易
3. **API集成**: 项目已集成真实的市场数据API，生产环境需要配置相应的API密钥
4. **安全性**: 生产环境需要配置HTTPS和适当的安全措施

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License