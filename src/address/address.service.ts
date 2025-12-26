import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, data: Partial<Address>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const address = this.addressRepository.create({
      ...data,
      user,
    });

    const saved = await this.addressRepository.save(address);

    if (data.isDefault) {
      await this.setDefault(userId, saved.id);
      return this.findOne(userId, saved.id);
    }

    return saved;
  }

  async findAll(userId: string) {
    return this.addressRepository.find({
      where: { user: { id: userId } as any },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const addr = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!addr) throw new NotFoundException('Address not found');
    if (addr.user?.id !== userId) throw new ForbiddenException();
    return addr;
  }

  async update(userId: string, id: string, patch: Partial<Address>) {
    const addr = await this.findOne(userId, id);
    Object.assign(addr, patch);
    const saved = await this.addressRepository.save(addr);

    if (patch.isDefault) {
      await this.setDefault(userId, saved.id);
      return this.findOne(userId, saved.id);
    }

    return saved;
  }

  async remove(userId: string, id: string) {
    const addr = await this.findOne(userId, id);
    await this.addressRepository.remove(addr);
    return { deleted: true };
  }

  async setDefault(userId: string, id: string) {
    const addresses = await this.addressRepository.find({
      where: { user: { id: userId } as any },
    });

    for (const a of addresses) {
      a.isDefault = a.id === id;
    }

    await this.addressRepository.save(addresses);
    return { updated: true };
  }
}
