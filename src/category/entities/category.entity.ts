import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  description: string;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
