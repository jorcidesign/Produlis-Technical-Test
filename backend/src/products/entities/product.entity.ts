import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductEntity {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Laptop Pro' })
  name!: string;

  @ApiPropertyOptional({ example: 'High-performance laptop', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: 'SKU-001', nullable: true })
  sku!: string | null;

  @ApiProperty({ example: '1299.99' })
  price!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
