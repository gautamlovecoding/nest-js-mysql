import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  postId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  content: string;
}
