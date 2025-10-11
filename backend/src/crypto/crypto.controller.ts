import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { Cryptocurrency } from './entities/crypto.entity';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get()
  @ApiOperation({ summary: '获取所有加密货币' })
  @ApiResponse({ status: 200, description: '返回加密货币列表', type: [Cryptocurrency] })
  async findAll(): Promise<Cryptocurrency[]> {
    return this.cryptoService.findAll();
  }

  @Get('top')
  @ApiOperation({ summary: '获取热门加密货币' })
  @ApiResponse({ status: 200, description: '返回热门加密货币列表', type: [Cryptocurrency] })
  async getTopCryptos(@Query('limit') limit: number = 10): Promise<Cryptocurrency[]> {
    return this.cryptoService.getTopCryptos(limit);
  }

  @Get(':symbol')
  @ApiOperation({ summary: '获取特定加密货币信息' })
  @ApiResponse({ status: 200, description: '返回加密货币信息', type: Cryptocurrency })
  async findOne(@Param('symbol') symbol: string): Promise<Cryptocurrency> {
    return this.cryptoService.findOne(symbol);
  }

  @Get(':symbol/history')
  @ApiOperation({ summary: '获取加密货币价格历史' })
  @ApiResponse({ status: 200, description: '返回价格历史数据' })
  async getPriceHistory(
    @Param('symbol') symbol: string,
    @Query('days') days: number = 7,
  ): Promise<any[]> {
    return this.cryptoService.getPriceHistory(symbol, days);
  }

  @Get('market/overview')
  @ApiOperation({ summary: '获取市场概览' })
  @ApiResponse({ status: 200, description: '返回市场总体数据' })
  async getMarketOverview(): Promise<any> {
    const cryptos = await this.cryptoService.findAll();
    
    const totalMarketCap = cryptos.reduce((sum, crypto) => sum + crypto.marketCap, 0);
    const totalVolume = cryptos.reduce((sum, crypto) => sum + crypto.volume24h, 0);
    
    return {
      totalMarketCap: parseFloat(totalMarketCap.toFixed(2)),
      totalVolume24h: parseFloat(totalVolume.toFixed(2)),
      activeCryptos: cryptos.length,
      timestamp: new Date().toISOString(),
    };
  }
}