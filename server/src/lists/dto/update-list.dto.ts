import { PartialType } from '@nestjs/mapped-types';
import { CreateListDto } from './create-list.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateListDto extends PartialType(
  OmitType(CreateListDto, ['folder_id'] as const),
) {}
