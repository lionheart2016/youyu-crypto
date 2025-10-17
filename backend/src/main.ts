import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// 添加BigInt序列化支持
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe());

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('Crypto Trading API')
    .setDescription('加密货币交易平台API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
  console.log(`🚀 后端服务运行在 http://localhost:3002`);
  console.log(`📚 API文档运行在 http://localhost:3002/api`);
}
bootstrap();