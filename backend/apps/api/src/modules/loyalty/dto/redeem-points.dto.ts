import { IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class RedeemPointsDto {
  @IsUUID()
  guestId: string;

  @IsInt()
  @IsPositive()
  points: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}
