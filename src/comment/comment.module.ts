import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post, User])],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
