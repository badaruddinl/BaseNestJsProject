import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateMagicCodeDto } from './create-magic-code.dto';

export class UpdateMagicCodeDto extends PartialType(CreateMagicCodeDto) {
  @ApiProperty()
  @IsOptional()
  status: string;
}
