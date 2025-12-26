import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Address } from '../../address/entities/address.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user: User;

  @ManyToOne(() => Address, { onDelete: 'SET NULL', nullable: true })
  shippingAddress: Address;

  @Column({ type: 'varchar', length: 30, default: 'created' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'subtotal_amount' })
  subtotalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'shipping_amount' })
  shippingAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
