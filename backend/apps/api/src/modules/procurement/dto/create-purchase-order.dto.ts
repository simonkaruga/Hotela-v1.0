import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsUUID, ValidateNested } from 'class-validator';

class PurchaseOrderItemInput {
  @IsUUID()
  inventoryItemId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  propertyId: string;

  @IsUUID()
  supplierId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemInput)
  items: PurchaseOrderItemInput[];
}
