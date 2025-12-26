import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/auth/get-user.decorator';
import { Roles } from '../common/auth/roles.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderService } from './order.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  listMine(@GetUser() user: any) {
    return this.orderService.listForUser(user.userId);
  }

  @Get(':id')
  getMine(@GetUser() user: any, @Param('id') id: string) {
    return this.orderService.findOneForUser(user.userId, id);
  }

  @Post('checkout')
  checkout(@GetUser() user: any, @Body(ValidationPipe) dto: CheckoutDto) {
    return this.orderService.checkoutFromCart(user.userId, dto.addressId);
  }

  @Roles('admin')
  @Get('/admin/all')
  listAll() {
    return this.orderService.listAll();
  }
}
