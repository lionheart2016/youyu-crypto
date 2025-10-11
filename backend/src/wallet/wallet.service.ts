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
    
    // 这里应该从市场价格API获取实时价格
    // 目前使用模拟价格
    const mockPrices = {
      'ETH': 3250.42,
      'BTC': 43250.67,
      'BNB': 315.78,
      'SOL': 102.45,
    };

    const assetsValue = assets.reduce((sum, asset) => {
      const price = mockPrices[asset.symbol] || 0;
      return sum + asset.amount * price;
    }, 0);

    return wallet.balance + assetsValue;
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

  // 模拟从区块链获取余额
  async syncWalletBalance(address: string): Promise<number> {
    // 这里应该调用以太坊节点API获取真实余额
    // 目前返回模拟余额
    return Math.random() * 10; // 0-10 ETH的随机余额
  }
}