import { IsDateString, IsUUID } from 'class-validator';

export class DailyReportQueryDto {
  @IsUUID()
  propertyId: string;

  @IsDateString()
  date: string;
}
