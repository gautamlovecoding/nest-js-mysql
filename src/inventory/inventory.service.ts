import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductInventory } from './entities/product-inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductInventory)
    private readonly inventoryRepository: Repository<ProductInventory>,
  ) {}

  async getByProductId(productId: string) {
    const inv = await this.inventoryRepository.findOne({
      where: { product: { id: productId } as any },
      relations: ['product'],
    });
    if (!inv) throw new NotFoundException('Inventory not found');
    return inv;
  }

  async ensure(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.inventoryRepository.findOne({
      where: { product: { id: productId } as any },
      relations: ['product'],
    });
    if (existing) return existing;

    const inv = this.inventoryRepository.create({
      product,
      quantity: 0,
      reservedQuantity: 0,
    });
    return this.inventoryRepository.save(inv);
  }

  async setStock(productId: string, quantity: number) {
    const inv = await this.ensure(productId);

    if (quantity < inv.reservedQuantity) {
      throw new BadRequestException('Quantity cannot be less than reserved');
    }

    inv.quantity = quantity;
    return this.inventoryRepository.save(inv);
  }

  async adjustStock(productId: string, delta: number) {
    const inv = await this.ensure(productId);
    const next = inv.quantity + delta;

    if (next < inv.reservedQuantity) {
      throw new BadRequestException('Quantity cannot be less than reserved');
    }

    inv.quantity = next;
    return this.inventoryRepository.save(inv);
  }
}
