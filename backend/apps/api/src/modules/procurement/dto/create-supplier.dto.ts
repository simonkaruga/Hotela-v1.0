import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSupplierDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  contact?: string;
}
