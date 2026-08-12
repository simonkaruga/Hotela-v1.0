import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateTreatmentDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  durationMinutes: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
