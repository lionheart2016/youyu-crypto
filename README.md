# YY-Wallet 应用

## 项目概述

YY-Wallet是一个基于区块链技术的钱包应用，提供用户认证、钱包管理、资产查看和交易功能。本项目采用现代化的前后端分离架构，确保安全性和用户体验的同时，提供流畅的区块链交互能力。

## 技术栈

### 后端 (backend)
- **框架**: NestJS (TypeScript)
- **端口**: 默认3002
- **功能**: 处理业务逻辑、数据库操作、与区块链交互、API服务

### 前端 (react-privy-app)
- **框架**: React
- **认证**: Privy Auth
- **端口**: 默认3000
- **功能**: 用户界面、Privy认证、钱包管理操作

## 项目结构

```
├── backend/            # NestJS 后端项目
│   ├── src/            # 源代码
│   │   ├── crypto/     # 加密相关功能
│   │   ├── trading/    # 交易相关功能
│   │   └── wallet/     # 钱包相关功能
│   └── package.json    # 后端依赖
├── react-privy-app/    # React 前端项目
│   ├── src/            # 源代码
│   │   ├── components/ # React 组件
│   │   ├── App.jsx     # 主应用组件
│   │   └── main.jsx    # 应用入口
│   └── package.json    # 前端依赖
└── README.md           # 项目说明文档
```

## 快速开始

### 前置要求

- Node.js (v14 或更高版本)
- npm 或 yarn
- 浏览器支持：Chrome, Firefox, Safari, Edge (最新版本)

### 安装与运行

#### 1. 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../react-privy-app
npm install
```

#### 2. 环境配置

在各目录下复制 `.env.example` 为 `.env` 并配置相应参数：

```bash
# 后端环境配置
cp backend/.env.example backend/.env

# 前端环境配置
cp react-privy-app/.env.example react-privy-app/.env
```

#### 3. 运行项目

**后端服务**：

```bash
cd backend
npm run start:dev
```
后端服务将运行在 http://localhost:3002

**前端应用**：

```bash
cd react-privy-app
npm run dev
```
前端应用将运行在 http://localhost:3000

## 功能特性

### 用户认证
- 使用Privy进行邮箱验证码登录
- 会话管理与安全认证

### 钱包管理
- 创建新钱包
- 连接外部钱包（如MetaMask）
- 钱包列表查看
- 钱包操作（连接、断开等）

### 资产管理
- 查看钱包余额
- 查看交易历史
- 资产概览

### 交易功能
- 发送交易
- 签名消息
- 网络切换支持

## 测试账号

用于开发和测试的账号信息：
- **邮箱**: test-1143@privy.io
- **验证码**: 894575

## 开发说明

### 前端开发

- 组件位于 `src/components/` 目录
- 主应用逻辑在 `App.jsx` 中实现
- 样式通过 CSS 模块管理

### 后端开发

- API 路由在各功能模块中定义
- 服务层处理核心业务逻辑
- 使用 NestJS 模块化架构组织代码

## 部署说明

项目提供了 Docker 支持，可以使用以下方式进行部署：

```bash
# 使用 Docker Compose 启动项目
cd react-privy-app
docker-compose up -d
```

详细部署信息请参考 `react-privy-app/DEPLOYMENT_SUMMARY.md` 文件。

## 安全注意事项

- 敏感操作需要用户确认
- 遵循区块链安全最佳实践
- 私钥和敏感信息不会被存储在服务器端

## 许可证

[MIT License](LICENSE)