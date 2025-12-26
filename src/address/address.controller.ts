import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/auth/get-user.decorator';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  findAll(@GetUser() user: any) {
    return this.addressService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@GetUser() user: any, @Param('id') id: string) {
    return this.addressService.findOne(user.userId, id);
  }

  @Post()
  create(@GetUser() user: any, @Body(ValidationPipe) dto: CreateAddressDto) {
    return this.addressService.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateAddressDto,
  ) {
    return this.addressService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.addressService.remove(user.userId, id);
  }
}
