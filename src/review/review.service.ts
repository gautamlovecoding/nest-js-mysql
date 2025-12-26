import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Review } from './entities/review.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(productId: string, userId: string, data: Partial<Review>) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.reviewRepository.findOne({
      where: { product: { id: productId } as any, author: { id: userId } as any },
    });
    if (existing) throw new ConflictException('You already reviewed this product');

    const review = this.reviewRepository.create({
      ...data,
      product,
      author: user,
    });
    return this.reviewRepository.save(review);
  }

  async listByProduct(productId: string) {
    return this.reviewRepository.find({
      where: { product: { id: productId } as any },
      relations: ['author', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepository.remove(review);
    return { deleted: true };
  }
}
