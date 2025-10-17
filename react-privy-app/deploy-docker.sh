#!/bin/bash

# React项目Docker本地部署脚本

echo "🚀 开始React项目Docker本地部署..."

# 检查Docker是否已安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker是否正在运行
if ! docker info &> /dev/null; then
    echo "❌ Docker未运行，请启动Docker服务"
    exit 1
fi

# 检查docker-compose是否已安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose未安装，请先安装docker-compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 安装依赖并构建项目
echo "📦 安装依赖..."
npm install

echo "🔨 构建React项目..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo "❌ 构建失败，dist目录不存在"
    exit 1
fi

echo "✅ React项目构建成功"

# 停止并移除现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建Docker镜像
echo "🐳 构建Docker镜像..."
docker-compose build --no-cache

# 启动容器
echo "🚀 启动Docker容器..."
docker-compose up -d

# 检查容器状态
echo "🔍 检查容器状态..."
sleep 3
if docker-compose ps | grep -q "Up"; then
    echo "✅ Docker容器启动成功"
else
    echo "❌ Docker容器启动失败"
    echo "📋 查看日志:"
    docker-compose logs
    exit 1
fi

echo "🎉 React项目Docker部署完成！"