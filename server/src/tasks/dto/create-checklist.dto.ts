import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateChecklistDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
