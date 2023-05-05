import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, isEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsOptional()
  password: string;

  @ApiHideProperty()
  @IsOptional()
  keyword: string;
}
