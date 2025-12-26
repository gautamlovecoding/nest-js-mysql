import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Tag } from '../../tag/entities/tag.entity';
import { Review } from '../../review/entities/review.entity';
import { ProductInventory } from '../../inventory/entities/product-inventory.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.products, { cascade: false })
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToOne(() => ProductInventory, (inv) => inv.product)
  inventory: ProductInventory;
}
