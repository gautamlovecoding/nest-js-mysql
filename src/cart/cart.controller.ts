import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/auth/get-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getActiveCart(@GetUser() user: any) {
    return this.cartService.getActiveCart(user.userId);
  }

  @Post('items')
  addItem(@GetUser() user: any, @Body(ValidationPipe) dto: AddCartItemDto) {
    return this.cartService.addItem(user.userId, dto.productId, dto.quantity);
  }

  @Patch('items/:itemId')
  updateItem(
    @GetUser() user: any,
    @Param('itemId') itemId: string,
    @Body(ValidationPipe) dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(user.userId, itemId, dto.quantity);
  }

  @Delete('items/:itemId')
  removeItem(@GetUser() user: any, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.userId, itemId);
  }

  @Post('clear')
  clear(@GetUser() user: any) {
    return this.cartService.clear(user.userId);
  }
}
