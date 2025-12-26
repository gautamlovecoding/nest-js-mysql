import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post as HttpPost,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/auth/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  create(@GetUser() user: any, @Body(ValidationPipe) body: CreateCommentDto) {
    return this.commentService.create(user.userId, body);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.commentService.remove(user.userId, id);
  }
}
