import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBanksDto {
  @ApiProperty()
  @IsNotEmpty()
  bank_name: string;

  @ApiProperty()
  @IsNotEmpty()
  account_name: string;

  @ApiProperty()
  @IsNotEmpty()
  account_number: number;
}
