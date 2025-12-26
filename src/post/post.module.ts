import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Comment } from '../comment/entities/comment.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Category, Tag, Comment])],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
