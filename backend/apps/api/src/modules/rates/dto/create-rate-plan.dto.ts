import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { RatePlanType } from '@prisma/client';

export class CreateRatePlanDto {
  @IsUUID()
  roomTypeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(RatePlanType)
  type?: RatePlanType;

  @IsNumber()
  adjustmentPct: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minStay?: number;
}
