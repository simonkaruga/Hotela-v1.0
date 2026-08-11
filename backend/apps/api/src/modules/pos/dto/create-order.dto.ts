import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsPositive, IsUUID, ValidateNested } from 'class-validator';

class OrderItemInput {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  reservationId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];
}
