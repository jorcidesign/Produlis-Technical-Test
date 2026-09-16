import { ApiProperty } from '@nestjs/swagger';
import { OrderItemEntity } from './order-item.entity.js';

export class OrderEntity {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  customerId!: number;

  @ApiProperty({ example: 'pending', enum: ['pending', 'completed', 'cancelled'] })
  status!: string;

  @ApiProperty({ example: '2599.98' })
  totalAmount!: string;

  @ApiProperty({ type: [OrderItemEntity] })
  items!: OrderItemEntity[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
