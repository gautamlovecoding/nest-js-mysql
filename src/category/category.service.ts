import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(data: Partial<Category>) {
    const existing = await this.categoryRepository.findOne({
      where: { name: data.name },
    });
    if (existing) throw new ConflictException('Category name already exists');

    const c = this.categoryRepository.create(data as any);
    return this.categoryRepository.save(c);
  }

  async findAll() {
    return this.categoryRepository.find({ relations: ['posts', 'products'] });
  }

  async findOne(id: string) {
    const c = await this.categoryRepository.findOne({
      where: { id },
      relations: ['posts', 'products'],
    });
    if (!c) throw new NotFoundException('Category not found');
    return c;
  }

  async update(id: string, patch: Partial<Category>) {
    const c = await this.findOne(id);

    if (patch.name && patch.name !== c.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: patch.name },
      });
      if (existing) throw new ConflictException('Category name already exists');
    }

    Object.assign(c, patch);
    return this.categoryRepository.save(c);
  }

  async remove(id: string) {
    const c = await this.findOne(id);
    await this.categoryRepository.remove(c);
    return { deleted: true };
  }
}
