import { ApiProperty } from '@nestjs/swagger';

export class OrderItemEntity {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  orderId!: number;

  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: 'Laptop Pro' })
  productName!: string;

  @ApiProperty({ example: '1299.99' })
  unitPrice!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: '2599.98' })
  subtotal!: string;
}
