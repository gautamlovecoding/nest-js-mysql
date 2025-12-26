import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(name: string) {
    const existing = await this.tagRepository.findOne({ where: { name } });
    if (existing) throw new ConflictException('Tag already exists');

    const tag = this.tagRepository.create({ name });
    return this.tagRepository.save(tag);
  }

  async findAll() {
    return this.tagRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: string, patch: Partial<Tag>) {
    const tag = await this.findOne(id);

    if (patch.name && patch.name !== tag.name) {
      const existing = await this.tagRepository.findOne({
        where: { name: patch.name },
      });
      if (existing) throw new ConflictException('Tag already exists');
    }

    Object.assign(tag, patch);
    return this.tagRepository.save(tag);
  }

  async remove(id: string) {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
    return { deleted: true };
  }
}
