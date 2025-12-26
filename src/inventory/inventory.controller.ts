import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { InventoryService } from './inventory.service';
import { SetStockDto } from './dto/set-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products/:productId')
  getInventory(@Param('productId') productId: string) {
    return this.inventoryService.getByProductId(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Put('products/:productId/stock')
  setStock(
    @Param('productId') productId: string,
    @Body(ValidationPipe) dto: SetStockDto,
  ) {
    return this.inventoryService.setStock(productId, dto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Patch('products/:productId/stock')
  adjustStock(
    @Param('productId') productId: string,
    @Body(ValidationPipe) dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(productId, dto.delta);
  }
}
