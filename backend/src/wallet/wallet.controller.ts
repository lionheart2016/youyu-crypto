import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { Wallet, WalletAsset, Transaction } from './entities/wallet.entity';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({ summary: '创建钱包' })
  @ApiResponse({ status: 201, description: '钱包创建成功', type: Wallet })
  async createWallet(
    @Body('userId') userId: string,
    @Body('address') address: string,
  ): Promise<Wallet> {
    return this.walletService.createWallet(userId, address);
  }

  @Get(':userId')
  @ApiOperation({ summary: '获取钱包信息' })
  @ApiResponse({ status: 200, description: '返回钱包信息', type: Wallet })
  async getWallet(@Param('userId') userId: string): Promise<Wallet> {
    return this.walletService.getWallet(userId);
  }

  @Get(':userId/overview')
  @ApiOperation({ summary: '获取钱包概览' })
  @ApiResponse({ status: 200, description: '返回钱包完整概览' })
  async getWalletOverview(@Param('userId') userId: string): Promise<any> {
    return this.walletService.getWalletOverview(userId);
  }

  @Get(':userId/assets')
  @ApiOperation({ summary: '获取钱包资产' })
  @ApiResponse({ status: 200, description: '返回钱包资产列表', type: [WalletAsset] })
  async getWalletAssets(@Param('userId') userId: string): Promise<WalletAsset[]> {
    const wallet = await this.walletService.getWallet(userId);
    if (!wallet) {
      return [];
    }
    return this.walletService.getWalletAssets(wallet.id);
  }

  @Get(':userId/transactions')
  @ApiOperation({ summary: '获取交易记录' })
  @ApiResponse({ status: 200, description: '返回交易记录列表', type: [Transaction] })
  async getTransactions(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50,
  ): Promise<Transaction[]> {
    const wallet = await this.walletService.getWallet(userId);
    if (!wallet) {
      return [];
    }
    return this.walletService.getTransactions(wallet.id, limit);
  }

  @Post(':userId/deposit')
  @ApiOperation({ summary: '处理存款交易' })
  @ApiResponse({ status: 201, description: '存款交易处理成功' })
  async deposit(
    @Param('userId') userId: string,
    @Body('amount') amount: number,
    @Body('symbol') symbol: string = 'ETH',
    @Body('transactionHash') transactionHash: string,
  ): Promise<any> {
    const wallet = await this.walletService.getWallet(userId);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    // 验证交易哈希
    if (!transactionHash || !transactionHash.startsWith('0x')) {
      throw new Error('无效的交易哈希');
    }

    // 记录存款交易
    await this.walletService.createTransaction({
      walletId: wallet.id,
      type: 'deposit',
      symbol,
      amount,
      status: 'pending', // 等待区块链确认
      transactionHash,
      createdAt: new Date(),
    });

    return { message: '存款交易已提交，等待区块链确认', amount, transactionHash };
  }

  @Post(':userId/withdraw')
  @ApiOperation({ summary: '处理提现交易' })
  @ApiResponse({ status: 201, description: '提现交易处理成功' })
  async withdraw(
    @Param('userId') userId: string,
    @Body('amount') amount: number,
    @Body('symbol') symbol: string = 'ETH',
    @Body('toAddress') toAddress: string,
  ): Promise<any> {
    const wallet = await this.walletService.getWallet(userId);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    if (wallet.balance < amount) {
      throw new Error('余额不足');
    }

    // 验证提现地址
    if (!toAddress || !toAddress.startsWith('0x')) {
      throw new Error('无效的提现地址');
    }

    // 记录提现交易
    await this.walletService.createTransaction({
      walletId: wallet.id,
      type: 'withdrawal',
      symbol,
      amount: -amount,
      status: 'pending', // 等待区块链确认
      toAddress,
      createdAt: new Date(),
    });

    return { message: '提现交易已提交，等待区块链确认', amount, toAddress };
  }

  @Get('balance/:address')
  @ApiOperation({ summary: '获取链上余额' })
  @ApiResponse({ status: 200, description: '返回链上余额' })
  async getOnChainBalance(@Param('address') address: string): Promise<number> {
    return this.walletService.syncWalletBalance(address);
  }
}