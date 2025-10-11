import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { EthereumDataService } from './ethereum-data.service';
import { EthereumService } from './ethereum.service';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    HttpModule
  ],
  controllers: [TradingController],
  providers: [TradingService, EthereumDataService, EthereumService],
  exports: [TradingService, EthereumDataService, EthereumService],
})
export class TradingModule {}