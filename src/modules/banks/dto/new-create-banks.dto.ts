import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TypeStatusBanks } from 'src/models/entities/bank.entity';
import { CreateBanksDto } from './create-banks.dto';

export class NewCreateBanksDto extends CreateBanksDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsNotEmpty()
  bank_name: string;

  @ApiProperty()
  @IsNotEmpty()
  account_name: string;

  @ApiProperty()
  @IsNotEmpty()
  account_number: number;

  @ApiHideProperty()
  @ApiProperty({
    enum: [TypeStatusBanks.ACTIVE, TypeStatusBanks.INACTIVE],
    required: true,
    default: TypeStatusBanks.ACTIVE,
  })
  status: TypeStatusBanks;

  @ApiProperty()
  @IsNotEmpty()
  isDefault: boolean;
}
