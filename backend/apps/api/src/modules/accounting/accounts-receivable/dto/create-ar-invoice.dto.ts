import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateArInvoiceDto {
  @IsUUID()
  corporateAccountId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  dueDate: string;
}
