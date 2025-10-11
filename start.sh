#!/bin/bash

# YouyuCrypto 一键启动脚本
# 同时启动React认证应用、NestJS后端服务和Vue前端应用

echo "🚀 启动YouyuCrypto交易平台..."

# 检查是否安装了必要的依赖
check_dependencies() {
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 未安装Node.js，请先安装Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ 错误: 未安装npm"
        exit 1
    fi
}

# 检查环境变量配置
check_env() {
    if [ ! -f "frontend/.env" ]; then
        echo "⚠️  警告: frontend/.env文件不存在，请复制.env.example并配置Privy应用ID"
        echo "运行: cp frontend/.env.example frontend/.env"
    fi
    
    if [ ! -f "react-privy-app/.env" ]; then
        echo "⚠️  警告: react-privy-app/.env文件不存在，请复制.env.example并配置Privy应用ID"
        echo "运行: cp react-privy-app/.env.example react-privy-app/.env"
    fi
}

# 启动React认证应用 (端口3001)
start_react_app() {
    echo "🔐 启动React认证应用..."
    cd react-privy-app
    npm run dev &
    REACT_PID=$!
    cd ..
    echo "✅ React认证应用已启动 (PID: $REACT_PID)"
}

# 启动NestJS后端服务 (端口3002)
start_backend() {
    echo "🔧 启动后端服务..."
    cd backend
    npm run start:dev &
    BACKEND_PID=$!
    cd ..
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
}

# 启动Vue前端应用 (端口3000)
start_frontend() {
    echo "🌐 启动前端应用..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo "✅ 前端应用已启动 (PID: $FRONTEND_PID)"
}

# 显示启动信息
show_info() {
    echo ""
    echo "🎉 YouyuCrypto平台已启动完成！"
    echo ""
    echo "📱 访问地址:"
    echo "  前端应用: http://localhost:3000"
    echo "  认证应用: http://localhost:3001"
    echo "  后端API: http://localhost:3002"
    echo ""
    echo "💡 使用说明:"
    echo "  1. 打开浏览器访问 http://localhost:3000"
    echo "  2. 点击登录按钮进行Privy认证"
    echo "  3. 支持钱包、邮箱、Google等多种登录方式"
    echo ""
    echo "🛑 停止服务: 按Ctrl+C"
    echo ""
}

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    
    if [ ! -z "$REACT_PID" ]; then
        kill $REACT_PID 2>/dev/null
        echo "✅ React认证应用已停止"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ 后端服务已停止"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ 前端应用已停止"
    fi
    
    echo "👋 服务已全部停止"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 主启动流程
main() {
    echo "📋 检查依赖和环境..."
    check_dependencies
    check_env
    
    echo ""
    echo "🔄 开始启动服务..."
    
    start_react_app
    sleep 3
    
    start_backend
    sleep 3
    
    start_frontend
    sleep 5
    
    show_info
    
    # 等待用户中断
    while true; do
        sleep 1
    done
}

# 运行主函数
main

echo "🚀 启动 YouyuCrypto 加密货币交易平台..."

# 检查Node.js版本
node_version=$(node -v)
echo "Node.js 版本: $node_version"

# 启动后端服务
echo "📡 启动后端服务..."
cd backend
npm install
echo "✅ 后端依赖安装完成"

# 在新终端中启动后端
osascript -e 'tell application "Terminal" to do script "cd /Users/speed/Documents/Trae/yy-wallet/backend && npm run start:dev"'

# 等待后端启动
sleep 5

# 启动前端服务
echo "🌐 启动前端应用..."
cd ../frontend
npm install
echo "✅ 前端依赖安装完成"

# 在新终端中启动前端
osascript -e 'tell application "Terminal" to do script "cd /Users/speed/Documents/Trae/yy-wallet/frontend && npm run dev"'

echo "✅ 启动完成！"
echo ""
echo "📊 后端服务: http://localhost:3001"
echo "📚 API文档: http://localhost:3001/api"
echo "🌐 前端应用: http://localhost:3000"
echo ""
echo "💡 请确保已安装MetaMask钱包扩展"