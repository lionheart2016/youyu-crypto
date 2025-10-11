import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cryptocurrency } from './entities/crypto.entity';

@Injectable()
export class CryptoService implements OnModuleInit {
  constructor(
    @InjectRepository(Cryptocurrency)
    private cryptoRepository: Repository<Cryptocurrency>,
  ) {}

  async onModuleInit() {
    // 模块初始化时自动填充示例数据
    await this.seedData();
  }

  async findAll(): Promise<Cryptocurrency[]> {
    return this.cryptoRepository.find({
      order: { marketCap: 'DESC' },
    });
  }

  async findOne(symbol: string): Promise<Cryptocurrency> {
    return this.cryptoRepository.findOne({ where: { symbol } });
  }

  async updatePrices(cryptoData: Partial<Cryptocurrency>[]): Promise<void> {
    for (const data of cryptoData) {
      await this.cryptoRepository.upsert(data, ['symbol']);
    }
  }

  async getTopCryptos(limit: number = 10): Promise<Cryptocurrency[]> {
    return this.cryptoRepository.find({
      order: { marketCap: 'DESC' },
      take: limit,
    });
  }

  async getPriceHistory(symbol: string, days: number = 7): Promise<any[]> {
    // 模拟价格历史数据
    const basePrice = await this.getCurrentPrice(symbol);
    const history = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // 模拟价格波动
      const volatility = 0.05; // 5%波动
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const price = basePrice * (1 + randomChange);
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2)),
        volume: Math.random() * 1000000,
      });
    }
    
    return history;
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    const crypto = await this.cryptoRepository.findOne({ where: { symbol } });
    return crypto?.price || 0;
  }

  // 初始化一些示例数据
  async seedData(): Promise<void> {
    const existing = await this.cryptoRepository.count();
    if (existing > 0) {
      return; // 如果已有数据，不再重复填充
    }

    const sampleData = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 43250.67,
        change24h: 1.23,
        marketCap: 845000000000,
        volume24h: 28500000000,
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3250.42,
        change24h: 2.34,
        marketCap: 390000000000,
        volume24h: 18500000000,
      },
      {
        symbol: 'BNB',
        name: 'Binance Coin',
        price: 315.78,
        change24h: -0.56,
        marketCap: 48000000000,
        volume24h: 850000000,
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        price: 102.45,
        change24h: 5.67,
        marketCap: 42000000000,
        volume24h: 3200000000,
      },
    ];

    await this.updatePrices(sampleData);
    console.log('✅ 加密货币示例数据初始化完成');
  }
}