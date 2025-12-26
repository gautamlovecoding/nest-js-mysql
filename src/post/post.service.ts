import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { Tag } from '../tag/entities/tag.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(
    userId: string,
    data: {
      title: string;
      content?: string;
      categoryId?: string;
      tagIds?: string[];
    },
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const post = this.postRepository.create({
      title: data.title,
      content: data.content as any,
      author: user,
    });

    if (data.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: data.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
      post.category = category;
    }

    if (data.tagIds && data.tagIds.length > 0) {
      const tags = await this.tagRepository.find({
        where: { id: In(data.tagIds) },
      });
      post.tags = tags;
    }

    const saved = await this.postRepository.save(post);
    return this.findOne(saved.id);
  }

  async findAll() {
    return this.postRepository.find({
      relations: ['author', 'category', 'comments', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'comments', 'tags'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(
    userId: string,
    id: string,
    patch: {
      title?: string;
      content?: string;
      categoryId?: string;
      tagIds?: string[];
    },
  ) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author?.id !== userId) throw new ForbiddenException();

    if (patch.title !== undefined) post.title = patch.title as any;
    if (patch.content !== undefined) post.content = patch.content as any;

    if (patch.categoryId !== undefined) {
      if (!patch.categoryId) {
        post.category = null;
      } else {
        const category = await this.categoryRepository.findOne({
          where: { id: patch.categoryId },
        });
        if (!category) throw new NotFoundException('Category not found');
        post.category = category;
      }
    }

    if (patch.tagIds !== undefined) {
      if (!patch.tagIds || patch.tagIds.length === 0) {
        post.tags = [];
      } else {
        const tags = await this.tagRepository.find({
          where: { id: In(patch.tagIds) },
        });
        post.tags = tags;
      }
    }

    await this.postRepository.save(post);
    return this.findOne(id);
  }

  async remove(userId: string, id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author?.id !== userId) throw new ForbiddenException();

    await this.postRepository.remove(post);
    return { deleted: true };
  }
}
