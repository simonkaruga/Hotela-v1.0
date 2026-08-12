import { IsDateString, IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateInquiryDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsDateString()
  eventDate: string;

  @IsInt()
  @IsPositive()
  expectedGuests: number;
}
