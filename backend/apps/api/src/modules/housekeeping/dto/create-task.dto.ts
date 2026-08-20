import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  roomId: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
