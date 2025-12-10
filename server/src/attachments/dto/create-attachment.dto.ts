import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateAttachmentDto {
  @IsNotEmpty()
  @IsUrl()
  file_url: string;

  @IsNotEmpty()
  @IsString()
  file_name: string;

  @IsNotEmpty()
  @IsString()
  file_type: string;

  @IsOptional()
  @IsString()
  uploaded_by?: string;
}
