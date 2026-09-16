import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemInputDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt()
  @Min(1)
  product_id!: number;

  @ApiProperty({ example: 2, description: 'Quantity, must be greater than 0' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'Customer ID placing the order' })
  @IsInt()
  @Min(1)
  customer_id!: number;

  @ApiProperty({
    type: [OrderItemInputDto],
    description: 'Order items, at least one required',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];
}
