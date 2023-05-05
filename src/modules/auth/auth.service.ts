import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { TypeStatus, Users } from 'src/models/entities/users.entity';
import { MagicCodesService } from '../magic-codes/magic-codes.service';
import { HttpService } from '@nestjs/axios';
import { catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { AuthGoogleDTO } from './dto/auth-google.dto';
import { CreateUserLoginDto } from '../users/dto/create-user-login.dto';
import { randomString } from 'src/Utils/randomString';
import { ChangePassDto } from '../users/dto/change-pass.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private UsersService: UsersService,
    private magicCodeService: MagicCodesService,
    private readonly httpService: HttpService,
  ) {}

  public async register(registrationData: CreateUserLoginDto) {
    try {
      const createdUser = await this.UsersService.createAuth({
        ...registrationData,
        email: registrationData.email.toLowerCase(),
        keyword: await this.UsersService.keywordGenerator(
          registrationData.name,
          registrationData.email,
          registrationData.username,
        ),
      });
      return createdUser;
    } catch (error) {
      if (error.message == 'ALREADY_EXISTS_SUPER_ADMIN') {
        throw new HttpException(
          'FORBIDDEN_CREATE_SUPER_ADMIN',
          HttpStatus.FORBIDDEN,
        );
      }

      if (error.message == 'Email already exists on system') {
        throw new HttpException('EMAIL_ALREADY_EXISTS', HttpStatus.CONFLICT);
      }

      if (error.message == 'Username already exists on system') {
        throw new HttpException('USERNAME_IS_TAKEN', HttpStatus.CONFLICT);
      }

      // UniqueViolation == 23505
      if (error?.code === 23505) {
        throw new HttpException('EMAIL_ALREADY_EXISTS', HttpStatus.CONFLICT);
      }
      throw new HttpException('EMAIL_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }
  }

  public async update(id, data: UpdateUserDto) {
    try {
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
      }

      const updated = await this.UsersService.update(id, data);

      if (updated) {
        return {
          data: 'OK',
          message: 'SUCCESS',
        };
      }
    } catch (error) {
      throw new HttpException(
        'INTERNAL_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async get(id, data: UpdateUserDto) {
    try {
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
      }

      const updated = await this.UsersService.update(id, data);

      if (updated) {
        return {
          data: 'OK',
          message: 'SUCCESS',
        };
      }
    } catch (error) {
      throw new HttpException(
        'INTERNAL_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.UsersService.getByEmail(email.toLowerCase());
      await this.verifyPassword(plainTextPassword, user.password);

      if (user.status != TypeStatus.ACTIVE) {
        throw new HttpException('INVALID_CREDENTIALS', HttpStatus.BAD_REQUEST);
      }

      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.BAD_REQUEST);
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.BAD_REQUEST);
    }
  }

  async changePasswordWithVerify(password: ChangePassDto, id: string) {
    const userData = await this.UsersService.findOneMe(id);
    const comparePassword = await bcrypt.compare(
      password.currentPassword,
      userData.password,
    );

    if (comparePassword) {
      const updatePAssword = this.UsersService.updatePasswordVerify(
        password.newPassword,
        id,
      );

      return updatePAssword;
    }

    if (!comparePassword) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.BAD_REQUEST);
    }
  }

  public generateJwt(admin: Users) {
    const payload = {
      email: admin.email,
      role: admin.role,
      typeuser: admin.typeuser,
      photo: admin.photo,
      id: admin.id,
      name: admin.name,
      username: admin.username,
    };
    return {
      profile: payload,
      access_token: this.jwtService.sign(payload),
    };
  }

  public async generateInstantLogin(userId) {
    const user = await this.UsersService.findOne(userId);
    if (user) {
      const code = await this.magicCodeService.create({
        one_time_use: false,
        type: 'instant_login',
        data: JSON.stringify(user),
      });
      return code;
    }
  }

  public async verifyInstantLogin(code) {
    const result = await this.magicCodeService.verify(code);
    if (!result) {
      return {
        status: false,
        message: 'INVALID_CODE',
        data: null,
      };
    }
    const userInfo = JSON.parse(result.data);
    return {
      status: true,
      message: 'OK',
      data: this.generateJwt(userInfo),
    };
  }

  public async userOAuthLogin(tokenGoogle: AuthGoogleDTO) {
    const token = tokenGoogle.token;
    const { data } = await firstValueFrom(
      this.httpService
        .get(`https://www.googleapis.com/userinfo/v2/me?access_token=${token}`)
        .pipe(
          catchError((error) => {
            throw new HttpException(
              {
                status: HttpStatus.NOT_FOUND,
                error_code: 'USER_NOT_FOUND',
                message: 'users_dont_exist',
              },
              HttpStatus.NOT_FOUND,
            );
          }),
        ),
    );

    try {
      const user = await this.UsersService.getByEmail(data.email.toLowerCase());
      if (user) {
        return {
          data,
          user: this.generateJwt(user),
        };
      }
    } catch (error) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
  }

  public async userOAuthRegister(tokenGoogle: AuthGoogleDTO) {
    const token = tokenGoogle.token;
    const { data } = await firstValueFrom(
      this.httpService
        .get(`https://www.googleapis.com/userinfo/v2/me?access_token=${token}`)
        .pipe(
          catchError((error) => {
            throw new HttpException(
              {
                status: HttpStatus.NOT_FOUND,
                error_code: 'USER_NOT_FOUND',
                message: 'users_dont_exist',
              },
              HttpStatus.NOT_FOUND,
            );
          }),
        ),
    );

    const user = await this.UsersService.getByEmailExists(
      data.email.toLowerCase(),
    );

    if (user) {
      throw new HttpException(
        'THE_USER_HAS_BEEN_REGISTERED',
        HttpStatus.CONFLICT,
      );
    }

    const passordRandom = randomString(10, '#Aa!');
    const payload = {
      name: data.name,
      email: data.email,
      password: passordRandom,
      photo: data.picture,
      username: null,
      keyword: '',
    };

    await this.UsersService.create(payload);

    const newUser = await this.UsersService.getByEmail(
      data.email.toLowerCase(),
    );

    return this.generateJwt(newUser);
  }
}
