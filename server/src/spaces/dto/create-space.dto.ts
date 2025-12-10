import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSpaceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
