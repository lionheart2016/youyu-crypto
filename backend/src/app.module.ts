import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';
import { TradingModule } from './trading/trading.module';
import { WalletModule } from './wallet/wallet.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 开发环境使用，生产环境应设为false
    }),
    CryptoModule,
    TradingModule,
    WalletModule,
    HealthModule,
  ],
})
export class AppModule {}