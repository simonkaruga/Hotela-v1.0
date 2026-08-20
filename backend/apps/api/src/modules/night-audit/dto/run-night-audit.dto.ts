import { IsDateString, IsUUID } from 'class-validator';

export class RunNightAuditDto {
  @IsUUID()
  propertyId: string;

  @IsDateString()
  date: string;
}
