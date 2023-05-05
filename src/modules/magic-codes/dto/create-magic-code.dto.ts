import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMagicCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  one_time_use: boolean;

  @ApiProperty()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  data: string;
}
