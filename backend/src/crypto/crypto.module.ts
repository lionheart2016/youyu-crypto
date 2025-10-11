import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { Cryptocurrency } from './entities/crypto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cryptocurrency])],
  controllers: [CryptoController],
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}