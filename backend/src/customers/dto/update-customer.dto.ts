import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Acme Corp Updated' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'new@acme.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '+52 55 9876 5432' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}
