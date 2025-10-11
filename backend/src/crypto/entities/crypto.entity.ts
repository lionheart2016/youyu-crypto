import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cryptocurrencies')
export class Cryptocurrency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  symbol: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 20, scale: 8 })
  price: number;

  @Column('decimal', { precision: 10, scale: 4 })
  change24h: number;

  @Column('decimal', { precision: 20, scale: 8 })
  marketCap: number;

  @Column('decimal', { precision: 20, scale: 8 })
  volume24h: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}