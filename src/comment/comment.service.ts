import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, data: { postId: string; content: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const post = await this.postRepository.findOne({ where: { id: data.postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepository.create({
      content: data.content,
      author: user,
      post,
    });
    return this.commentRepository.save(comment);
  }

  async findAll() {
    return this.commentRepository.find({ relations: ['post', 'author'] });
  }

  async findOne(id: string) {
    const c = await this.commentRepository.findOne({ where: { id }, relations: ['post', 'author'] });
    if (!c) throw new NotFoundException('Comment not found');
    return c;
  }

  async remove(userId: string, id: string) {
    const c = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!c) throw new NotFoundException('Comment not found');
    if (c.author?.id !== userId) throw new ForbiddenException();

    await this.commentRepository.remove(c);
    return { deleted: true };
  }
}
