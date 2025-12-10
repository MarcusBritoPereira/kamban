import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['list_id'] as const),
) {}
