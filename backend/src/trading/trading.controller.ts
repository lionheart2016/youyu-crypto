import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TradingService } from './trading.service';
import { EthereumDataService } from './ethereum-data.service';
import { EthereumService } from './ethereum.service';
import { Order } from './entities/order.entity';

@ApiTags('trading')
@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly ethereumDataService: EthereumDataService,
    private readonly ethereumService: EthereumService,
  ) {}

  @Post('order')
  @ApiOperation({ summary: '创建新订单' })
  @ApiResponse({ status: 201, description: '订单创建成功', type: Order })
  async createOrder(@Body() orderData: Partial<Order>): Promise<Order> {
    const order = await this.tradingService.createOrder(orderData);
    return this.tradingService.processOrder(order);
  }

  @Get('orders/:userId')
  @ApiOperation({ summary: '获取用户订单' })
  @ApiResponse({ status: 200, description: '返回用户订单列表', type: [Order] })
  async getOrders(@Param('userId') userId: string): Promise<Order[]> {
    return this.tradingService.getOrders(userId);
  }

  @Get('orderbook/:symbol')
  @ApiOperation({ summary: '获取订单簿' })
  @ApiResponse({ status: 200, description: '返回买卖订单簿' })
  async getOrderBook(@Param('symbol') symbol: string): Promise<any> {
    return this.tradingService.getOrderBook(symbol);
  }

  @Get('trades/:symbol')
  @ApiOperation({ summary: '获取最近交易' })
  @ApiResponse({ status: 200, description: '返回最近交易记录', type: [Order] })
  async getRecentTrades(
    @Param('symbol') symbol: string,
    @Query('limit') limit: number = 50,
  ): Promise<Order[]> {
    return this.tradingService.getRecentTrades(symbol, limit);
  }

  @Put('order/:orderId/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiResponse({ status: 200, description: '订单取消成功', type: Order })
  async cancelOrder(
    @Param('orderId') orderId: number,
    @Query('userId') userId: string,
  ): Promise<Order> {
    return this.tradingService.cancelOrder(orderId, userId);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: '获取用户交易统计' })
  @ApiResponse({ status: 200, description: '返回用户交易统计数据' })
  async getUserTradingStats(@Param('userId') userId: string): Promise<any> {
    return this.tradingService.getUserTradingStats(userId);
  }

  @Get('pairs')
  @ApiOperation({ summary: '获取交易对列表' })
  @ApiResponse({ status: 200, description: '返回可用交易对' })
  async getTradingPairs(): Promise<string[]> {
    return ['ETH/USDT', 'BTC/USDT', 'BNB/USDT', 'SOL/USDT'];
  }

  @Get('market-data')
  @ApiOperation({ summary: '获取市场数据' })
  @ApiResponse({ status: 200, description: '返回市场数据列表' })
  async getMarketData(): Promise<any> {
    return this.ethereumDataService.getMarketList();
  }

  @Get('eth-data')
  @ApiOperation({ summary: '获取ETH/USDT数据' })
  @ApiResponse({ status: 200, description: '返回ETH/USDT实时数据' })
  async getETHData(): Promise<any> {
    return this.ethereumDataService.getETHUSDTData();
  }

  @Get('price-history/:symbol')
  @ApiOperation({ summary: '获取价格历史' })
  @ApiResponse({ status: 200, description: '返回价格历史数据' })
  async getPriceHistory(
    @Param('symbol') symbol: string,
    @Query('days') days: number = 7
  ): Promise<any> {
    return this.ethereumDataService.getPriceHistory(symbol, days);
  }

  @Get('ethereum-stats')
  @ApiOperation({ summary: '获取以太坊网络统计' })
  @ApiResponse({ status: 200, description: '返回以太坊网络统计数据' })
  async getEthereumStats(): Promise<any> {
    return this.ethereumDataService.getEthereumStats();
  }

  @Get('dex-orderbook/:pair')
  @ApiOperation({ summary: '获取DEX订单簿' })
  @ApiResponse({ status: 200, description: '返回去中心化交易所订单簿' })
  async getDEXOrderBook(@Param('pair') pair: string): Promise<any> {
    return this.ethereumDataService.getDEXOrderBook(pair);
  }

  // 以太坊区块链相关API
  @Get('ethereum/balance/:address')
  @ApiOperation({ summary: '获取以太坊地址余额' })
  @ApiResponse({ status: 200, description: '返回ETH和代币余额' })
  async getEthereumBalance(@Param('address') address: string): Promise<any> {
    return this.ethereumService.getBalance(address);
  }

  @Post('ethereum/transaction/eth')
  @ApiOperation({ summary: '发送ETH交易' })
  @ApiResponse({ status: 200, description: '返回交易收据' })
  async sendETHTransaction(
    @Body() transactionData: {
      from: string;
      to: string;
      amount: string;
      signature: string;
    }
  ): Promise<any> {
    return this.ethereumService.sendETHTransaction(
      transactionData.from,
      transactionData.to,
      transactionData.amount,
      transactionData.signature
    );
  }

  @Post('ethereum/transaction/token')
  @ApiOperation({ summary: '发送代币交易' })
  @ApiResponse({ status: 200, description: '返回交易收据' })
  async sendTokenTransaction(
    @Body() transactionData: {
      from: string;
      to: string;
      tokenAddress: string;
      amount: string;
      signature: string;
    }
  ): Promise<any> {
    return this.ethereumService.sendTokenTransaction(
      transactionData.from,
      transactionData.to,
      transactionData.tokenAddress,
      transactionData.amount,
      transactionData.signature
    );
  }

  @Get('ethereum/transaction/:txHash')
  @ApiOperation({ summary: '获取交易状态' })
  @ApiResponse({ status: 200, description: '返回交易状态信息' })
  async getTransactionStatus(@Param('txHash') txHash: string): Promise<any> {
    return this.ethereumService.getTransactionStatus(txHash);
  }

  @Get('ethereum/gas-estimation')
  @ApiOperation({ summary: '获取Gas估算' })
  @ApiResponse({ status: 200, description: '返回Gas估算信息' })
  async getGasEstimation(
    @Query('to') to: string,
    @Query('value') value: string,
    @Query('data') data?: string
  ): Promise<any> {
    return this.ethereumService.getGasEstimation(to, value, data);
  }

  @Get('ethereum/block-number')
  @ApiOperation({ summary: '获取当前区块号' })
  @ApiResponse({ status: 200, description: '返回当前区块号' })
  async getCurrentBlockNumber(): Promise<number> {
    return this.ethereumService.getCurrentBlockNumber();
  }

  @Get('ethereum/token-info/:address')
  @ApiOperation({ summary: '获取代币信息' })
  @ApiResponse({ status: 200, description: '返回代币详细信息' })
  async getTokenInfo(@Param('address') address: string): Promise<any> {
    return this.ethereumService.getTokenInfo(address);
  }

  @Get('ethereum/validate-address/:address')
  @ApiOperation({ summary: '验证以太坊地址' })
  @ApiResponse({ status: 200, description: '返回地址是否有效' })
  async validateAddress(@Param('address') address: string): Promise<{ isValid: boolean }> {
    return { isValid: this.ethereumService.isValidAddress(address) };
  }
}