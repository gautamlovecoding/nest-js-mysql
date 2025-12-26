import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../user/entities/user.entity';
import { Address } from '../address/entities/address.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { ProductInventory } from '../inventory/entities/product-inventory.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      User,
      Address,
      Cart,
      CartItem,
      ProductInventory,
    ]),
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
