import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Full name of the customer' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'contact@acme.com', description: 'Unique email address' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiPropertyOptional({ example: '+52 55 1234 5678', description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}
