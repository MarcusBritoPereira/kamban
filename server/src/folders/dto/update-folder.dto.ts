import { PartialType } from '@nestjs/mapped-types';
import { CreateFolderDto } from './create-folder.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateFolderDto extends PartialType(
  OmitType(CreateFolderDto, ['space_id'] as const),
) {}
