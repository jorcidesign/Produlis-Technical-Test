import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop Pro', description: 'Product name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'High-performance laptop' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'SKU-001', description: 'Unique SKU identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiProperty({ example: 1299.99, description: 'Price must be > 0' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price!: number;
}
