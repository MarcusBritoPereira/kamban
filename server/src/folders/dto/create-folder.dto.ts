import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  @IsUUID()
  space_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
