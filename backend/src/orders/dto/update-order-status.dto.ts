import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'completed',
    enum: ['completed', 'cancelled'],
    description:
      'Target status. Only valid from "pending": pending -> completed or pending -> cancelled.',
  })
  @IsIn(['completed', 'cancelled'])
  status!: 'completed' | 'cancelled';
}
