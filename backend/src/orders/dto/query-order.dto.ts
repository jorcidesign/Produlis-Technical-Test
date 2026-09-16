import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class QueryOrderDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-indexed)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'pending',
    enum: ['pending', 'completed', 'cancelled'],
    description: 'Filter by order status',
  })
  @IsOptional()
  @IsIn(['pending', 'completed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by customer ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customer_id?: number;
}
