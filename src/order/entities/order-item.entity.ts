import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price_snapshot' })
  unitPriceSnapshot: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'line_total' })
  lineTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
