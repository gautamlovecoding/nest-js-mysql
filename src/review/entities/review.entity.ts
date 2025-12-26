import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../user/entities/user.entity';

@Entity('reviews')
@Unique(['product', 'author'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
