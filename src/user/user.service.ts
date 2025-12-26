import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Remove password from response
    delete savedUser.password;
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: ['posts', 'comments'],
    });
    return users.map((u) => {
      // hide password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = u as any;
      return rest as User;
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts', 'comments'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // hide password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user as any;
    return rest as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Remove password from response
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
