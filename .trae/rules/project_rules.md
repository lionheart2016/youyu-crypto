1，项目分为：backend、react-privy-app与文件夹名称对应
2，backend为NestJS项目，负责处理业务逻辑、数据库操作、与前端通信等 默认运行在http://localhost:3002
3，react-privy-app为React项目，负责Privy认证，它以iframe的形式嵌入到Vue应用中 默认运行在http://localhost:3000
4，项目不要再使用模拟数据
5，默认使用邮箱登录方式，测试账号：test-1143@privy.io，验证码：894575