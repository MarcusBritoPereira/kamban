import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateListDto {
  @IsNotEmpty()
  @IsUUID()
  folder_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
