import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../user/entities/user.entity';
import { Address } from '../address/entities/address.entity';
import { ProductInventory } from '../inventory/entities/product-inventory.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductInventory)
    private readonly inventoryRepository: Repository<ProductInventory>,
  ) {}

  async listForUser(userId: string) {
    return this.orderRepository.find({
      where: { user: { id: userId } as any },
      relations: ['items', 'items.product', 'shippingAddress'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.user?.id !== userId) throw new ForbiddenException();
    return order;
  }

  async listAll() {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
      order: { createdAt: 'DESC' },
    });
  }

  async checkoutFromCart(userId: string, addressId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const address = await this.addressRepository.findOne({
      where: { id: addressId },
      relations: ['user'],
    });
    if (!address) throw new NotFoundException('Address not found');
    if (address.user?.id !== userId) throw new ForbiddenException();

    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } as any, status: 'active' },
      relations: ['user', 'items', 'items.product'],
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const items = cart.items || [];
    if (items.length === 0) throw new BadRequestException('Cart is empty');

    return this.dataSource.transaction(async (manager) => {
      let subtotal = 0;

      for (const item of items) {
        const inv = await manager.getRepository(ProductInventory).findOne({
          where: { product: { id: item.product.id } as any },
          relations: ['product'],
          lock: { mode: 'pessimistic_write' },
        });

        if (inv) {
          const available = inv.quantity - inv.reservedQuantity;
          if (item.quantity > available) {
            throw new BadRequestException(
              `Insufficient stock for product ${item.product.id}`,
            );
          }
        }

        subtotal += Number(item.unitPriceSnapshot) * item.quantity;
      }

      const shipping = subtotal > 100 ? 0 : 10;
      const total = subtotal + shipping;

      const order = manager.getRepository(Order).create({
        user,
        shippingAddress: address,
        status: 'created',
        subtotalAmount: subtotal as any,
        shippingAmount: shipping as any,
        totalAmount: total as any,
        items: [],
      });

      const savedOrder = await manager.getRepository(Order).save(order);

      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const lineTotal = Number(item.unitPriceSnapshot) * item.quantity;

        const orderItem = manager.getRepository(OrderItem).create({
          order: savedOrder,
          product: item.product,
          quantity: item.quantity,
          unitPriceSnapshot: item.unitPriceSnapshot as any,
          lineTotal: lineTotal as any,
        });
        orderItems.push(orderItem);

        const inv = await manager.getRepository(ProductInventory).findOne({
          where: { product: { id: item.product.id } as any },
          relations: ['product'],
          lock: { mode: 'pessimistic_write' },
        });

        if (inv) {
          inv.quantity = inv.quantity - item.quantity;
          await manager.getRepository(ProductInventory).save(inv);
        }
      }

      await manager.getRepository(OrderItem).save(orderItems);

      cart.status = 'checked_out';
      await manager.getRepository(Cart).save(cart);
      await manager.getRepository(CartItem).delete({ cart: { id: cart.id } as any });

      return manager.getRepository(Order).findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'items.product', 'shippingAddress'],
      });
    });
  }
}
