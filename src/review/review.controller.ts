import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { GetUser } from '../common/auth/get-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';

@Controller('products/:productId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  list(@Param('productId') productId: string) {
    return this.reviewService.listByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('productId') productId: string,
    @GetUser() user: any,
    @Body(ValidationPipe) dto: CreateReviewDto,
  ) {
    return this.reviewService.create(productId, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
