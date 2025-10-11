import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletAsset, Transaction } from './entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletAsset)
    private assetRepository: Repository<WalletAsset>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createWallet(userId: string, address: string): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      userId,
      address,
      balance: 0,
    });
    return this.walletRepository.save(wallet);
  }

  async getWallet(userId: string): Promise<Wallet> {
    return this.walletRepository.findOne({ where: { userId } });
  }

  async getWalletAssets(walletId: number): Promise<WalletAsset[]> {
    return this.assetRepository.find({ where: { walletId } });
  }

  async getTransactions(walletId: number, limit: number = 50): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async updateBalance(walletId: number, amount: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    wallet.balance += amount;
    return this.walletRepository.save(wallet);
  }

  async updateAsset(walletId: number, symbol: string, amount: number, price?: number): Promise<WalletAsset> {
    let asset = await this.assetRepository.findOne({
      where: { walletId, symbol },
    });

    if (!asset) {
      asset = this.assetRepository.create({
        walletId,
        symbol,
        amount: 0,
        averagePrice: 0,
      });
    }

    if (amount > 0) {
      // 买入或增加资产
      const totalValue = asset.amount * asset.averagePrice + amount * (price || 0);
      asset.amount += amount;
      asset.averagePrice = totalValue / asset.amount;
    } else {
      // 卖出或减少资产
      asset.amount += amount; // amount为负数
      if (asset.amount <= 0) {
        await this.assetRepository.remove(asset);
        return null;
      }
    }

    return this.assetRepository.save(asset);
  }

  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(transactionData);
    return this.transactionRepository.save(transaction);
  }

  async getPortfolioValue(walletId: number): Promise<number> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    const assets = await this.assetRepository.find({ where: { walletId } });
    
    // 从CoinGecko API获取实时价格
    try {
      const symbols = assets.map(asset => asset.symbol.toLowerCase()).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`);
      const priceData = await response.json();
      
      const assetsValue = assets.reduce((sum, asset) => {
        const price = priceData[asset.symbol.toLowerCase()]?.usd || 0;
        return sum + asset.amount * price;
      }, 0);

      return wallet.balance + assetsValue;
    } catch (error) {
      console.error('获取实时价格失败:', error);
      // 如果API调用失败，使用默认值
      const assetsValue = assets.reduce((sum, asset) => {
        return sum + asset.amount * 0;
      }, 0);
      return wallet.balance + assetsValue;
    }
  }

  async getWalletOverview(userId: string): Promise<any> {
    const wallet = await this.getWallet(userId);
    if (!wallet) {
      return null;
    }

    const assets = await this.getWalletAssets(wallet.id);
    const portfolioValue = await this.getPortfolioValue(wallet.id);
    const transactions = await this.getTransactions(wallet.id, 10);

    return {
      wallet,
      assets,
      portfolioValue: parseFloat(portfolioValue.toFixed(2)),
      recentTransactions: transactions,
    };
  }

  // 从区块链获取真实余额
  async syncWalletBalance(address: string): Promise<number> {
    try {
      // 使用Etherscan API获取真实余额
      const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
      const response = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`);
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        // 将wei转换为ETH
        const balanceInWei = data.result;
        const balanceInEth = parseFloat(balanceInWei) / 1e18;
        return balanceInEth;
      } else {
        throw new Error('获取余额失败: ' + data.message);
      }
    } catch (error) {
      console.error('获取区块链余额失败:', error);
      // 如果API调用失败，返回0
      return 0;
    }
  }
}