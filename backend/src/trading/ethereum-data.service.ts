import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

interface MarketData {
  pair: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  high: number;
  low: number;
  marketCap?: number;
}

interface PriceHistory {
  timestamp: number;
  price: number;
  volume: number;
}

@Injectable()
export class EthereumDataService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // 获取ETH/USDT交易对数据
  async getETHUSDTData(): Promise<MarketData> {
    try {
      const response = await this.httpService.get(
        `${this.baseUrl}/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      ).toPromise();

      const ethData = response.data.ethereum;
      
      // 模拟一些额外的数据（实际可以从其他API获取）
      return {
        pair: 'ETH/USDT',
        symbol: 'E',
        name: '以太坊',
        price: ethData.usd,
        change: ethData.usd_24h_change || 0,
        volume: ethData.usd_24h_vol || 0,
        high: ethData.usd * 1.02, // 模拟最高价
        low: ethData.usd * 0.98,  // 模拟最低价
        marketCap: ethData.usd_market_cap
      };
    } catch (error) {
      console.error('获取ETH数据失败:', error);
      // 返回模拟数据作为备选
      return this.getFallbackETHData();
    }
  }

  // 获取多个交易对数据
  async getMarketList(): Promise<MarketData[]> {
    try {
      const coins = ['ethereum', 'bitcoin', 'binancecoin', 'solana'];
      const response = await this.httpService.get(
        `${this.baseUrl}/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      ).toPromise();

      const marketData: MarketData[] = [];
      
      // ETH/USDT
      if (response.data.ethereum) {
        const eth = response.data.ethereum;
        marketData.push({
          pair: 'ETH/USDT',
          symbol: 'E',
          name: '以太坊',
          price: eth.usd,
          change: eth.usd_24h_change || 0,
          volume: eth.usd_24h_vol || 0,
          high: eth.usd * 1.02,
          low: eth.usd * 0.98,
          marketCap: eth.usd_market_cap
        });
      }

      // BTC/USDT
      if (response.data.bitcoin) {
        const btc = response.data.bitcoin;
        marketData.push({
          pair: 'BTC/USDT',
          symbol: 'B',
          name: '比特币',
          price: btc.usd,
          change: btc.usd_24h_change || 0,
          volume: btc.usd_24h_vol || 0,
          high: btc.usd * 1.02,
          low: btc.usd * 0.98,
          marketCap: btc.usd_market_cap
        });
      }

      // BNB/USDT
      if (response.data.binancecoin) {
        const bnb = response.data.binancecoin;
        marketData.push({
          pair: 'BNB/USDT',
          symbol: 'B',
          name: '币安币',
          price: bnb.usd,
          change: bnb.usd_24h_change || 0,
          volume: bnb.usd_24h_vol || 0,
          high: bnb.usd * 1.02,
          low: bnb.usd * 0.98,
          marketCap: bnb.usd_market_cap
        });
      }

      // SOL/USDT
      if (response.data.solana) {
        const sol = response.data.solana;
        marketData.push({
          pair: 'SOL/USDT',
          symbol: 'S',
          name: 'Solana',
          price: sol.usd,
          change: sol.usd_24h_change || 0,
          volume: sol.usd_24h_vol || 0,
          high: sol.usd * 1.02,
          low: sol.usd * 0.98,
          marketCap: sol.usd_market_cap
        });
      }

      return marketData;
    } catch (error) {
      console.error('获取市场数据失败:', error);
      return this.getFallbackMarketData();
    }
  }

  // 获取价格历史数据
  async getPriceHistory(symbol: string, days: number = 7): Promise<PriceHistory[]> {
    try {
      const coinId = this.getCoinId(symbol);
      const response = await this.httpService.get(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      ).toPromise();

      return response.data.prices.map(([timestamp, price]) => ({
        timestamp,
        price,
        volume: 0 // 实际可以从响应中获取
      }));
    } catch (error) {
      console.error('获取价格历史失败:', error);
      return this.generateMockPriceHistory();
    }
  }

  // 获取实时订单簿数据（从去中心化交易所）
  async getDEXOrderBook(pair: string): Promise<{
    buyOrders: Array<{ price: number; amount: number }>;
    sellOrders: Array<{ price: number; amount: number }>;
  }> {
    try {
      // 这里可以集成Uniswap、PancakeSwap等DEX的API
      // 目前返回模拟数据
      return this.generateMockOrderBook();
    } catch (error) {
      console.error('获取DEX订单簿失败:', error);
      return this.generateMockOrderBook();
    }
  }

  // 获取以太坊网络统计
  async getEthereumStats(): Promise<{
    gasPrice: number;
    blockNumber: number;
    transactions: number;
    networkUtilization: number;
  }> {
    try {
      // 这里可以集成Etherscan API或其他以太坊节点API
      return {
        gasPrice: 30, // Gwei
        blockNumber: 18900000,
        transactions: 1500000,
        networkUtilization: 0.85
      };
    } catch (error) {
      console.error('获取以太坊统计失败:', error);
      return {
        gasPrice: 30,
        blockNumber: 18900000,
        transactions: 1500000,
        networkUtilization: 0.85
      };
    }
  }

  private getCoinId(symbol: string): string {
    const coinMap = {
      'ETH': 'ethereum',
      'BTC': 'bitcoin',
      'BNB': 'binancecoin',
      'SOL': 'solana'
    };
    return coinMap[symbol] || 'ethereum';
  }

  private getFallbackETHData(): MarketData {
    return {
      pair: 'ETH/USDT',
      symbol: 'E',
      name: '以太坊',
      price: 3250.42,
      change: 2.34,
      volume: 1250000000,
      high: 3280.15,
      low: 3210.76
    };
  }

  private getFallbackMarketData(): MarketData[] {
    return [
      {
        pair: 'ETH/USDT',
        symbol: 'E',
        name: '以太坊',
        price: 3250.42,
        change: 2.34,
        volume: 1250000000,
        high: 3280.15,
        low: 3210.76
      },
      {
        pair: 'BTC/USDT',
        symbol: 'B',
        name: '比特币',
        price: 43250.67,
        change: 1.89,
        volume: 2850000000,
        high: 43820.45,
        low: 42980.12
      },
      {
        pair: 'BNB/USDT',
        symbol: 'B',
        name: '币安币',
        price: 325.78,
        change: -0.56,
        volume: 450000000,
        high: 332.45,
        low: 320.12
      },
      {
        pair: 'SOL/USDT',
        symbol: 'S',
        name: 'Solana',
        price: 125.34,
        change: 5.23,
        volume: 780000000,
        high: 128.67,
        low: 119.45
      }
    ];
  }

  private generateMockPriceHistory(): PriceHistory[] {
    const history: PriceHistory[] = [];
    const basePrice = 3200;
    const now = Date.now();
    
    for (let i = 7; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const price = basePrice + (Math.random() - 0.5) * 200;
      history.push({
        timestamp,
        price,
        volume: Math.random() * 1000000
      });
    }
    
    return history;
  }

  private generateMockOrderBook() {
    const buyOrders = [
      { price: 3248.32, amount: 0.95 },
      { price: 3247.18, amount: 1.42 },
      { price: 3246.54, amount: 0.78 }
    ];
    
    const sellOrders = [
      { price: 3252.45, amount: 1.24 },
      { price: 3251.89, amount: 0.87 },
      { price: 3250.76, amount: 2.15 }
    ];
    
    return { buyOrders, sellOrders };
  }
}