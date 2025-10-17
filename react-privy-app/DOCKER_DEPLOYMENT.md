# React项目Docker本地部署指南

## 环境要求

- Docker 已安装并正常运行
- Docker Compose 已安装
- Node.js 和 npm 已安装（用于本地构建）

## 部署方案

### 方案一：Docker部署（推荐）

#### 1. 检查Docker环境

确保Docker已安装并运行：
```bash
docker --version
docker-compose --version
docker info
```

#### 2. 使用一键部署脚本

在项目根目录执行：
```bash
./deploy-docker.sh
```

该脚本会自动完成以下步骤：
- 检查Docker环境
- 安装npm依赖
- 构建React项目
- 构建Docker镜像
- 启动Docker容器

**注意**：如果Docker镜像拉取失败，可以尝试以下解决方案：
1. 配置Docker国内镜像源
2. 使用方案二：本地部署
3. 手动修改Dockerfile中的镜像源

### 3. 手动部署（可选）

如果不想使用脚本，可以手动执行：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 构建Docker镜像
docker-compose build

# 启动容器
docker-compose up -d
```

### 方案二：本地部署（备用方案）

如果Docker部署遇到问题，可以使用本地部署方案：

#### 1. 使用一键本地部署脚本

```bash
./deploy-local.sh
```

该脚本会：
- 安装依赖
- 构建项目
- 启动本地HTTP服务器

#### 2. 手动本地部署

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 使用Python启动HTTP服务器
cd dist && python3 -m http.server 3000

# 或者使用Node.js
npx serve -s dist -p 3000
```

### 4. 验证部署

部署完成后，访问：http://localhost:3000

### 5. 常用命令

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs

# 停止容器
docker-compose down

# 重新构建并启动
docker-compose down && docker-compose build && docker-compose up -d
```

## 配置说明

### Docker镜像源优化

Dockerfile中已配置使用国内镜像源：
- 基础镜像：`registry.docker-cn.com/library/nginx:alpine`
- Alpine源：使用阿里云镜像源

### Nginx配置

nginx.conf已配置：
- React Router支持（单页应用）
- 静态资源缓存优化
- 安全头设置

### 端口映射

- 本地端口：3000
- 容器端口：80

## 故障排查

### 构建失败
- 检查npm依赖是否完整
- 确保dist目录生成成功

### 容器启动失败
- 检查端口3000是否被占用
- 查看容器日志：`docker-compose logs`

### 访问问题
- 确认容器状态为`Up`
- 检查防火墙设置
- 验证Nginx配置是否正确

## 注意事项

1. 本项目采用本地构建，Docker仅用于运行环境
2. 构建过程需要Node.js环境
3. 确保dist目录存在且包含构建文件
4. 使用国内镜像源加速拉取速度