import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { AdminType, TypeUser } from 'src/models/entities/users.entity';
import { CreateUserLoginDto } from './create-user-login.dto';

export class UpdateUserDto extends PartialType(CreateUserLoginDto) {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsOptional()
  typeuser: TypeUser;

  @ApiProperty()
  @IsOptional()
  role: AdminType;
}
