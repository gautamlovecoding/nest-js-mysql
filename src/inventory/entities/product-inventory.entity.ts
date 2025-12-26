import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('product_inventory')
export class ProductInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Product, (product) => product.inventory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0, name: 'reserved_quantity' })
  reservedQuantity: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
