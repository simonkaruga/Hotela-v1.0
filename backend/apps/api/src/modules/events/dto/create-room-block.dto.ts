import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateRoomBlockDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @IsPositive()
  roomsBlocked: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
