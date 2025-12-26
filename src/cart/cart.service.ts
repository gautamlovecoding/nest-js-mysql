import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { ProductInventory } from '../inventory/entities/product-inventory.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductInventory)
    private readonly inventoryRepository: Repository<ProductInventory>,
  ) {}

  async getActiveCart(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } as any, status: 'active' },
      relations: ['items', 'items.product'],
    });

    if (cart) return cart;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newCart = this.cartRepository.create({
      user,
      status: 'active',
      items: [],
    });

    return this.cartRepository.save(newCart);
  }

  async addItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) throw new BadRequestException('Quantity must be > 0');

    const cart = await this.getActiveCart(userId);

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const inv = await this.inventoryRepository.findOne({
      where: { product: { id: productId } as any },
      relations: ['product'],
    });

    if (inv && quantity > inv.quantity - inv.reservedQuantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const existing = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id } as any, product: { id: productId } as any },
      relations: ['cart', 'product'],
    });

    if (existing) {
      existing.quantity += quantity;
      existing.unitPriceSnapshot = product.price as any;
      return this.cartItemRepository.save(existing);
    }

    const item = this.cartItemRepository.create({
      cart,
      product,
      quantity,
      unitPriceSnapshot: product.price as any,
    });

    return this.cartItemRepository.save(item);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity < 0) throw new BadRequestException('Quantity must be >= 0');

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user', 'product'],
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart?.user?.id !== userId) throw new ForbiddenException();

    if (quantity === 0) {
      await this.cartItemRepository.remove(item);
      return { deleted: true };
    }

    const inv = await this.inventoryRepository.findOne({
      where: { product: { id: item.product.id } as any },
      relations: ['product'],
    });

    if (inv && quantity > inv.quantity - inv.reservedQuantity) {
      throw new BadRequestException('Insufficient stock');
    }

    item.quantity = quantity;
    item.unitPriceSnapshot = item.product.price as any;

    return this.cartItemRepository.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user'],
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart?.user?.id !== userId) throw new ForbiddenException();

    await this.cartItemRepository.remove(item);
    return { deleted: true };
  }

  async clear(userId: string) {
    const cart = await this.getActiveCart(userId);
    await this.cartItemRepository.delete({ cart: { id: cart.id } as any });
    return { cleared: true };
  }
}
