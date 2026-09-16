import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerEntity {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Acme Corp' })
  name!: string;

  @ApiProperty({ example: 'contact@acme.com' })
  email!: string;

  @ApiPropertyOptional({ example: '+52 55 1234 5678', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
