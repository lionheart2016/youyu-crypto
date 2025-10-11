import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  balance: number;

  @Column({ default: 'active' })
  status: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('wallet_assets')
export class WalletAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  walletId: number;

  @Column()
  symbol: string;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  averagePrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  walletId: number;

  @Column()
  type: 'deposit' | 'withdrawal' | 'trade';

  @Column()
  symbol: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  price: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  fee: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @Column({ nullable: true })
  txHash: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ nullable: true })
  toAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}