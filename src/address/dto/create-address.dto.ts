import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  line1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  city: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  state: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  country: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
