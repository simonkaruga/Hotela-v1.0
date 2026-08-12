import { IsNumber, IsPositive } from 'class-validator';

export class CreateQuoteDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  depositAmount: number;
}
