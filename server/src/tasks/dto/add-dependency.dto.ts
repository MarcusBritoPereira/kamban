import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddDependencyDto {
  @IsNotEmpty()
  @IsUUID()
  blocking_task_id: string;

  @IsOptional()
  @IsString()
  type?: string;
}
