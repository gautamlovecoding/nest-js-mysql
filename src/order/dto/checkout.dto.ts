import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CheckoutDto {
  @IsNotEmpty()
  @IsString()
  addressId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;
}
