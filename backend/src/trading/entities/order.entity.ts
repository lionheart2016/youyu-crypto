import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  symbol: string;

  @Column()
  type: 'buy' | 'sell';

  @Column()
  orderType: 'limit' | 'market';

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  price: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  filledAmount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'filled' | 'cancelled' | 'partial';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  filledAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;
}