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
    try {
      // 从CoinGecko API获取真实价格历史数据
      const coinId = this.getCoinId(symbol);
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
      const data = await response.json();
      
      // 处理价格数据
      const prices = data.prices || [];
      const volumes = data.total_volumes || [];
      
      const volumeMap = new Map(volumes.map(([timestamp, volume]) => [timestamp, volume]));
      
      return prices.map(([timestamp, price]) => {
        const date = new Date(timestamp);
        return {
          date: date.toISOString().split('T')[0],
          price: price,
          volume: volumeMap.get(timestamp) || 0,
        };
      });
    } catch (error) {
      console.error('获取价格历史失败:', error);
      // 如果API调用失败，返回空数组
      return [];
    }
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    const crypto = await this.cryptoRepository.findOne({ where: { symbol } });
    return crypto?.price || 0;
  }

  private getCoinId(symbol: string): string {
    const coinMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'DOGE': 'dogecoin',
      'XRP': 'ripple',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash'
    };
    return coinMap[symbol] || symbol.toLowerCase();
  }

  // 从API获取真实数据并初始化
  async seedData(): Promise<void> {
    const existing = await this.cryptoRepository.count();
    if (existing > 0) {
      return; // 如果已有数据，不再重复填充
    }

    try {
      // 从CoinGecko API获取真实数据
      const symbols = ['bitcoin', 'ethereum', 'binancecoin', 'solana'];
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbols.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`);
      const coinData = await response.json();

      const sampleData = coinData.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
      }));

      await this.updatePrices(sampleData);
      console.log('✅ 加密货币真实数据初始化完成');
    } catch (error) {
      console.error('获取真实数据失败，使用默认数据:', error);
      
      // 如果API调用失败，使用默认数据
      const defaultData = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 0,
          change24h: 0,
          marketCap: 0,
          volume24h: 0,
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 0,
          change24h: 0,
          marketCap: 0,
          volume24h: 0,
        },
        {
          symbol: 'BNB',
          name: 'Binance Coin',
          price: 0,
          change24h: 0,
          marketCap: 0,
          volume24h: 0,
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          price: 0,
          change24h: 0,
          marketCap: 0,
          volume24h: 0,
        },
      ];

      await this.updatePrices(defaultData);
      console.log('✅ 加密货币默认数据初始化完成');
    }
  }
}