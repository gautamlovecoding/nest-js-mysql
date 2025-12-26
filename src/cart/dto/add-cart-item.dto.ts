import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
