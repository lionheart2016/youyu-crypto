1，项目分为三块：backend、frontend、react-privy-app与文件夹名称对应
2，backend为NestJS项目，负责处理业务逻辑、数据库操作、与前端通信等
3，frontend为Vue3项目，负责用户界面、交互逻辑、与后端通信等
4，react-privy-app为React项目，负责Privy认证，它以iframe的形式嵌入到Vue应用中
5，frontend与react-privy-app通过postMessage实现跨窗口通信，实现用户登录状态同步和用户登出