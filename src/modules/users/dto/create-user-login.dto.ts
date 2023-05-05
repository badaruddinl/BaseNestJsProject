import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, isEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { TypeStatus } from 'src/models/entities/users.entity';
import { AdminType, TypeUser } from 'src/models/entities/users.entity';

export class CreateUserLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiHideProperty()
  @ApiProperty({
    enum: [AdminType.NON_ADMIN, AdminType.ADMIN, AdminType.SUPER_ADMIN],
    required: true,
  })
  role: AdminType;

  @ApiHideProperty()
  @ApiProperty({
    enum: [TypeUser.USER, TypeUser.EMPLOYEE, TypeUser.ADMIN],
    required: true,
    // default: TypeUser.USER,
  })
  typeuser: TypeUser;

  @ApiProperty()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsOptional()
  photo: string;

  @IsOptional()
  @ApiProperty({
    enum: TypeStatus,
    required: true,
  })
  status: TypeStatus;

  @ApiHideProperty()
  @IsOptional()
  keyword: string;
}
