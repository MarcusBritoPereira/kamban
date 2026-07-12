import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateTaskDto {
  @IsOptional()
  list_id: string;

  @IsOptional()
  @IsUUID()
  parent_task_id?: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assigneeIds?: string[];

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsString()
  recurrence_rule?: string;

  @IsOptional()
  @IsDateString()
  recurrence_until?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
