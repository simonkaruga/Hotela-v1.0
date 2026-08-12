import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;
}
