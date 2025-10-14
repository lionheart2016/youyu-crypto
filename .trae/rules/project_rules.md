1，项目分为三块：backend、frontend、react-privy-app与文件夹名称对应
2，backend为NestJS项目，负责处理业务逻辑、数据库操作、与前端通信等 默认运行在http://localhost:3002
3，frontend为Vue3项目，负责用户界面、交互逻辑、与后端通信等，默认运行在http://localhost:3000
4，react-privy-app为React项目，负责Privy认证，它以iframe的形式嵌入到Vue应用中 默认运行在http://localhost:3001
5，frontend与react-privy-app通过postMessage实现跨窗口通信，实现用户登录状态同步和用户登出
6，项目不要再使用模拟数据