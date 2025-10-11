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

  // 订单匹配引擎
  async processOrder(order: Order): Promise<Order> {
    // 获取当前订单簿
    const orderBook = await this.getOrderBook(order.symbol);
    
    if (order.orderType === 'market') {
      // 市价单立即匹配
      if (order.type === 'buy') {
        // 买入市价单：按最低卖价匹配
        const matchingSells = orderBook.sellOrders
          .filter(sell => sell.price <= order.price || order.price === 0)
          .sort((a, b) => a.price - b.price);
        
        await this.matchMarketOrder(order, matchingSells, 'buy');
      } else {
        // 卖出市价单：按最高买价匹配
        const matchingBuys = orderBook.buyOrders
          .filter(buy => buy.price >= order.price || order.price === 0)
          .sort((a, b) => b.price - a.price);
        
        await this.matchMarketOrder(order, matchingBuys, 'sell');
      }
    } else {
      // 限价单检查即时匹配可能性
      if (order.type === 'buy') {
        const matchingSells = orderBook.sellOrders
          .filter(sell => sell.price <= order.price)
          .sort((a, b) => a.price - b.price);
        
        if (matchingSells.length > 0) {
          await this.matchLimitOrder(order, matchingSells, 'buy');
        } else {
          order.status = 'pending';
        }
      } else {
        const matchingBuys = orderBook.buyOrders
          .filter(buy => buy.price >= order.price)
          .sort((a, b) => b.price - a.price);
        
        if (matchingBuys.length > 0) {
          await this.matchLimitOrder(order, matchingBuys, 'sell');
        } else {
          order.status = 'pending';
        }
      }
    }

    return this.orderRepository.save(order);
  }

  private async matchMarketOrder(order: Order, matchingOrders: Order[], orderType: 'buy' | 'sell'): Promise<void> {
    let remainingAmount = order.amount;
    
    for (const matchingOrder of matchingOrders) {
      if (remainingAmount <= 0) break;
      
      const fillAmount = Math.min(remainingAmount, matchingOrder.amount - (matchingOrder.filledAmount || 0));
      
      if (fillAmount > 0) {
        // 更新匹配订单
        matchingOrder.filledAmount = (matchingOrder.filledAmount || 0) + fillAmount;
        if (matchingOrder.filledAmount >= matchingOrder.amount) {
          matchingOrder.status = 'filled';
          matchingOrder.filledAt = new Date();
        }
        await this.orderRepository.save(matchingOrder);
        
        // 更新当前订单
        order.filledAmount = (order.filledAmount || 0) + fillAmount;
        remainingAmount -= fillAmount;
      }
    }
    
    if (order.filledAmount >= order.amount) {
      order.status = 'filled';
      order.filledAt = new Date();
    } else if (order.filledAmount > 0) {
      order.status = 'partial';
    } else {
      order.status = 'pending';
    }
  }

  private async matchLimitOrder(order: Order, matchingOrders: Order[], orderType: 'buy' | 'sell'): Promise<void> {
    let remainingAmount = order.amount;
    
    for (const matchingOrder of matchingOrders) {
      if (remainingAmount <= 0) break;
      
      const fillAmount = Math.min(remainingAmount, matchingOrder.amount - (matchingOrder.filledAmount || 0));
      
      if (fillAmount > 0) {
        // 更新匹配订单
        matchingOrder.filledAmount = (matchingOrder.filledAmount || 0) + fillAmount;
        if (matchingOrder.filledAmount >= matchingOrder.amount) {
          matchingOrder.status = 'filled';
          matchingOrder.filledAt = new Date();
        }
        await this.orderRepository.save(matchingOrder);
        
        // 更新当前订单
        order.filledAmount = (order.filledAmount || 0) + fillAmount;
        order.filledPrice = matchingOrder.price; // 使用匹配订单的价格
        remainingAmount -= fillAmount;
      }
    }
    
    if (order.filledAmount >= order.amount) {
      order.status = 'filled';
      order.filledAt = new Date();
    } else if (order.filledAmount > 0) {
      order.status = 'partial';
    } else {
      order.status = 'pending';
    }
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