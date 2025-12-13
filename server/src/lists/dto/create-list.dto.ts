import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateListDto {
  @IsOptional()
  folder_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
