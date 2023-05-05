import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePassDto {
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
