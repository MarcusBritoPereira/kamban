import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddAssigneeDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
