import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('cart_items')
@Unique(['cart', 'product'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price_snapshot' })
  unitPriceSnapshot: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
