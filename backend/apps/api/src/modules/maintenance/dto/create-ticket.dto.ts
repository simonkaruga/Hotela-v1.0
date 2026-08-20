import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { MaintenancePriority } from '@prisma/client';

export class CreateTicketDto {
  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
