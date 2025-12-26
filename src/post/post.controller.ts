import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/auth/get-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  create(@GetUser() user: any, @Body(ValidationPipe) body: CreatePostDto) {
    return this.postService.create(user.userId, body);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body(ValidationPipe) body: UpdatePostDto,
  ) {
    return this.postService.update(user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.postService.remove(user.userId, id);
  }
}
