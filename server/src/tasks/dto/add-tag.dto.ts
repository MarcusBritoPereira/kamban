import { IsNotEmpty, IsString } from 'class-validator';

export class AddTagDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  color: string;
}
