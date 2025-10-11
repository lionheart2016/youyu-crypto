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
  @ApiOperation({ summary: '模拟存款' })
  @ApiResponse({ status: 201, description: '存款成功' })
  async deposit(
    @Param('userId') userId: string,
    @Body('amount') amount: number,
    @Body('symbol') symbol: string = 'ETH',
  ): Promise<any> {
    const wallet = await this.walletService.getWallet(userId);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    // 更新余额
    await this.walletService.updateBalance(wallet.id, amount);
    
    // 记录交易
    await this.walletService.createTransaction({
      walletId: wallet.id,
      type: 'deposit',
      symbol,
      amount,
      status: 'completed',
      completedAt: new Date(),
    });

    return { message: '存款成功', amount };
  }

  @Post(':userId/withdraw')
  @ApiOperation({ summary: '模拟提现' })
  @ApiResponse({ status: 201, description: '提现成功' })
  async withdraw(
    @Param('userId') userId: string,
    @Body('amount') amount: number,
    @Body('symbol') symbol: string = 'ETH',
  ): Promise<any> {
    const wallet = await this.walletService.getWallet(userId);
    if (!wallet) {
      throw new Error('钱包不存在');
    }

    if (wallet.balance < amount) {
      throw new Error('余额不足');
    }

    // 更新余额
    await this.walletService.updateBalance(wallet.id, -amount);
    
    // 记录交易
    await this.walletService.createTransaction({
      walletId: wallet.id,
      type: 'withdrawal',
      symbol,
      amount: -amount,
      status: 'completed',
      completedAt: new Date(),
    });

    return { message: '提现成功', amount };
  }

  @Get('balance/:address')
  @ApiOperation({ summary: '获取链上余额' })
  @ApiResponse({ status: 200, description: '返回链上余额' })
  async getOnChainBalance(@Param('address') address: string): Promise<number> {
    return this.walletService.syncWalletBalance(address);
  }
}