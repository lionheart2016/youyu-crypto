# 使用官方Nginx镜像 - 指定amd64架构
FROM --platform=linux/amd64 10.9.68.150:80/library/nginx:latest

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 创建dist目录
RUN mkdir -p /usr/share/nginx/html

# 复制构建后的React应用
COPY dist /usr/share/nginx/html

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]