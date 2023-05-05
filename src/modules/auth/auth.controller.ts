import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthLoginDTO } from './dto/auth.dto';
import { Role } from './roles/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './roles/roles.decorator';
import { AuthGoogleDTO } from './dto/auth-google.dto';
import { CreateUserLoginDto } from '../users/dto/create-user-login.dto';
import { validationRole } from 'src/Utils/validationRole';
import { ChangePassDto } from '../users/dto/change-pass.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Body() body: AuthLoginDTO, @Request() req) {
    return await this.authService.generateJwt(req.user);
  }

  @Post('login-google')
  async userAuthGoogleLogin(@Body() token: AuthGoogleDTO) {
    return await this.authService.userOAuthLogin(token);
  }

  @Post('register-google')
  async userAuthGoogleRegister(@Body() token: AuthGoogleDTO) {
    return await this.authService.userOAuthRegister(token);
  }

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN || Role.SUPER_ADMIN)
  async register(@Body() body: CreateUserLoginDto, @Request() req) {
    const UserLoggedIn = req.user;
    await validationRole(UserLoggedIn.role, body);
    return await this.authService.register(body);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(@Body() body: ChangePassDto, @Request() req) {
    const UserLoggedIn = req.user;
    return await this.authService.changePasswordWithVerify(
      body,
      UserLoggedIn.id,
    );
  }

  @Get('verify/:code')
  async instantLogin(@Param('code') code: string, @Request() req) {
    return await this.authService.verifyInstantLogin(code);
  }
}
