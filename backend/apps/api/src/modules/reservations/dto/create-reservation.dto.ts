import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  propertyId: string;

  @IsUUID()
  guestId: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;
}
