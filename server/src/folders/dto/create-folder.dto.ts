import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @IsOptional()
  space_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
