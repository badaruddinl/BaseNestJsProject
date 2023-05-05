import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPassDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
