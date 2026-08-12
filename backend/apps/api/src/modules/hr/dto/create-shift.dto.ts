import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateShiftDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  department: string;
}
