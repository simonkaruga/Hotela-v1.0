import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  reservationId: string;

  @IsUUID()
  treatmentId: string;

  @IsString()
  @IsNotEmpty()
  therapistName: string;

  @IsDateString()
  scheduledAt: string;
}
