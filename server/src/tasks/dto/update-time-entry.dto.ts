import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTimeEntryDto {
  @IsOptional()
  @IsDateString()
  started_at?: string;

  @IsOptional()
  @IsDateString()
  ended_at?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration_minutes?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
