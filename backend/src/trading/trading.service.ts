import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class TradingService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async getOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderBook(symbol: string): Promise<{
    buyOrders: Order[];
    sellOrders: Order[];
  }> {
    const buyOrders = await this.orderRepository.find({
      where: { 
        symbol, 
        type: 'buy',
        status: 'pending'
      },
      order: { price: 'DESC' },
    });

    const sellOrders = await this.orderRepository.find({
      where: { 
        symbol, 
        type: 'sell',
        status: 'pending'
      },
      order: { price: 'ASC' },
    });

    return { buyOrders, sellOrders };
  }

  async cancelOrder(orderId: number, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new Error('只能取消待处理的订单');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    return this.orderRepository.save(order);
  }

  async getRecentTrades(symbol: string, limit: number = 50): Promise<Order[]> {
    return this.orderRepository.find({
      where: { 
        symbol,
        status: 'filled'
      },
      order: { filledAt: 'DESC' },
      take: limit,
    });
  }

  // 模拟订单匹配引擎
  async processOrder(order: Order): Promise<Order> {
    // 这里应该实现实际的订单匹配逻辑
    // 目前只是模拟处理
    
    if (order.orderType === 'market') {
      // 市价单立即成交
      order.status = 'filled';
      order.filledAmount = order.amount;
      order.filledAt = new Date();
    } else {
      // 限价单进入订单簿等待匹配
      order.status = 'pending';
    }

    return this.orderRepository.save(order);
  }

  // 获取用户交易统计
  async getUserTradingStats(userId: string): Promise<{
    totalTrades: number;
    totalVolume: number;
    profitLoss: number;
  }> {
    const orders = await this.orderRepository.find({
      where: { userId, status: 'filled' },
    });

    const totalTrades = orders.length;
    const totalVolume = orders.reduce((sum, order) => sum + order.amount, 0);
    
    // 简化的盈亏计算（实际需要更复杂的逻辑）
    const profitLoss = orders.reduce((sum, order) => {
      const baseProfit = order.type === 'buy' ? -order.amount * (order.price || 0) : order.amount * (order.price || 0);
      return sum + baseProfit;
    }, 0);

    return {
      totalTrades,
      totalVolume: parseFloat(totalVolume.toFixed(8)),
      profitLoss: parseFloat(profitLoss.toFixed(2)),
    };
  }
}