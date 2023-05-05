import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CreateBanksDto } from './create-banks.dto';

export class UpdateBanksDto extends CreateBanksDto {
  @ApiProperty()
  @IsOptional()
  bank_name: string;

  @ApiProperty()
  @IsOptional()
  account_name: string;

  @ApiProperty()
  @IsOptional()
  account_number: number;

  @ApiProperty()
  @IsOptional()
  isDefault: boolean;
}
