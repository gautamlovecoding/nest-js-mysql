import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Tag } from '../tag/entities/tag.entity';
import { ProductInventory } from '../inventory/entities/product-inventory.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(ProductInventory)
    private readonly inventoryRepository: Repository<ProductInventory>,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    sku?: string;
    price: number;
    categoryId?: string;
    tagIds?: string[];
  }) {
    const p = this.productRepository.create({
      name: data.name,
      description: data.description as any,
      sku: data.sku as any,
      price: data.price as any,
    });

    if (data.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: data.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
      p.category = category;
    }

    if (data.tagIds && data.tagIds.length > 0) {
      const tags = await this.tagRepository.find({
        where: { id: In(data.tagIds) },
      });
      p.tags = tags;
    }

    const saved = await this.productRepository.save(p);

    const inv = await this.inventoryRepository.findOne({
      where: { product: { id: saved.id } as any },
      relations: ['product'],
    });
    if (!inv) {
      await this.inventoryRepository.save(
        this.inventoryRepository.create({
          product: saved,
          quantity: 0,
          reservedQuantity: 0,
        }),
      );
    }

    return this.findOne(saved.id);
  }

  async findAll() {
    return this.productRepository.find({
      relations: ['category', 'tags', 'inventory', 'reviews'],
    });
  }

  async findOne(id: string) {
    const p = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'inventory', 'reviews'],
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async update(
    id: string,
    patch: {
      name?: string;
      description?: string;
      sku?: string;
      price?: number;
      categoryId?: string;
      tagIds?: string[];
    },
  ) {
    const p = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
    if (!p) throw new NotFoundException('Product not found');

    if (patch.name !== undefined) p.name = patch.name as any;
    if (patch.description !== undefined) p.description = patch.description as any;
    if (patch.sku !== undefined) p.sku = patch.sku as any;
    if (patch.price !== undefined) p.price = patch.price as any;

    if (patch.categoryId !== undefined) {
      if (!patch.categoryId) {
        p.category = null;
      } else {
        const category = await this.categoryRepository.findOne({
          where: { id: patch.categoryId },
        });
        if (!category) throw new NotFoundException('Category not found');
        p.category = category;
      }
    }

    if (patch.tagIds !== undefined) {
      if (!patch.tagIds || patch.tagIds.length === 0) {
        p.tags = [];
      } else {
        const tags = await this.tagRepository.find({
          where: { id: In(patch.tagIds) },
        });
        p.tags = tags;
      }
    }

    await this.productRepository.save(p);
    return this.findOne(id);
  }

  async remove(id: string) {
    const p = await this.productRepository.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    await this.productRepository.remove(p);
    return { deleted: true };
  }
}
