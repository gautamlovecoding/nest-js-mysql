import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { ProductInventory } from '../inventory/entities/product-inventory.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User, Product, ProductInventory])],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
