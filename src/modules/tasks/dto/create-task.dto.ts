import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'sending-email' })
  type: string;

  @ApiProperty({ example: 5, required: false })
  priority: number;

  @ApiProperty({ example: '2025-04-07T12:00:00Z', required: false })
  scheduleAt?: Date;
}
