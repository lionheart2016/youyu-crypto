#!/bin/bash

# 自动化部署脚本 - 构建amd64镜像并升级K8s部署
set -e

# 配置变量
APP_NAME="wallets-demo"
REPO="10.9.68.150:80/web3/$APP_NAME"
K8S_NAMESPACE="zero-va-dev"
# 使用明确的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_CONFIG="$SCRIPT_DIR/k8s/kubeconfig.yaml"
K8S_DEPLOYMENT="$SCRIPT_DIR/k8s/$APP_NAME-deployment.yaml"

# 颜色输出函数
green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }
red() { echo -e "\033[31m$1\033[0m"; }
blue() { echo -e "\033[34m$1\033[0m"; }

# 显示帮助信息
show_help() {
    echo "使用方法: $0 [选项]"
    echo "选项:"
    echo "  -t, --tag <标签>   指定Docker镜像标签 (默认: 使用日期时间)"
    echo "  -h, --help         显示帮助信息"
}

# 解析命令行参数
tag=$(date +"%Y%m%d-%H%M%S")
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            tag="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            red "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 镜像完整路径
IMAGE_FULL="$REPO:$tag"
yellow "使用镜像标签: $tag"

# 步骤1: 构建React应用
build_app() {
    blue "\n=== 步骤1: 构建React应用 ==="
    cd "$SCRIPT_DIR/react-privy-app"
    
    yellow "安装依赖..."
    npm install
    
    yellow "构建应用..."
    npm run build
    
    green "React应用构建完成!"
}

# 步骤2: 构建Docker镜像
build_docker() {
    blue "\n=== 步骤2: 构建amd64 Docker镜像 ==="
    
    yellow "构建镜像: $IMAGE_FULL ..."
    docker build -t "$IMAGE_FULL" . --platform=linux/amd64
    
    # 同时更新latest标签
    yellow "更新latest标签..."
    docker tag "$IMAGE_FULL" "$REPO:latest"
    
    green "Docker镜像构建完成!"
}

# 步骤3: 推送Docker镜像到仓库
push_docker() {
    blue "\n=== 步骤3: 推送Docker镜像到仓库 ==="
    
    yellow "推送标签镜像: $IMAGE_FULL ..."
    docker push "$IMAGE_FULL"
    
    yellow "推送latest镜像..."
    docker push "$REPO:latest"
    
    green "Docker镜像推送完成!"
}

# 步骤4: 更新K8s部署
update_k8s() {
    blue "\n=== 步骤4: 更新K8s部署 ==="

    # 直接使用APP_NAME作为容器名，更新镜像
    yellow "更新K8s部署镜像..."
    kubectl --kubeconfig="$K8S_CONFIG" set image deployment "$APP_NAME" -n "$K8S_NAMESPACE" "$APP_NAME=$IMAGE_FULL" || {
        red "更新K8s部署镜像失败"
        return 1
    }
    
    green "K8s配置更新完成!"
}

# 步骤5: 验证部署状态
verify_deployment() {
    blue "\n=== 步骤5: 验证部署状态 ==="
    
    yellow "等待新Pod创建完成..."
    sleep 5
    
    # 获取新Pod的名称
    new_pod=$(kubectl --kubeconfig="$K8S_CONFIG" get pods -n "$K8S_NAMESPACE" -l "app=$APP_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [ -z "$new_pod" ]; then
        red "无法找到新的Pod，请手动检查部署状态"
        return 1
    fi
    
    yellow "监控Pod $new_pod 的状态..."
    # 等待Pod变为Running状态
    kubectl --kubeconfig="$K8S_CONFIG" wait --for=condition=Ready pod "$new_pod" -n "$K8S_NAMESPACE" --timeout=60s || {
        red "Pod未在60秒内变为Ready状态"
        return 1
    }
    
    # 显示最终状态
    echo ""
    kubectl --kubeconfig="$K8S_CONFIG" get pods -n "$K8S_NAMESPACE" -l "app=$APP_NAME" -o wide
    
    green "\n部署验证成功! 应用已成功更新到版本 $tag"
}

# 主函数
main() {
    blue "\n========================================"
    blue "开始自动化部署流程..."
    blue "========================================"
    
    # Bash不支持try-catch语法，使用函数调用链
    if build_app && build_docker && push_docker && update_k8s && verify_deployment; then
        green "\n========================================"
        green "🎉 部署流程完全成功!"
        green "镜像: $IMAGE_FULL"
        green "========================================"
    else
        red "\n❌ 部署过程中出现错误!"
        exit 1
    fi
}

# 执行主函数
main