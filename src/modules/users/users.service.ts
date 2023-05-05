import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import {
  AdminType,
  TypeStatus,
  TypeUser,
  Users,
} from 'src/models/entities/users.entity';
import { RepositoryService } from 'src/models/repository/repository.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../notification/email/email.service';
import { EmailTemplate } from '../notification/email/template.enum';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { MagicCodesService } from '../magic-codes/magic-codes.service';
import { UpdatePassDto } from './dto/update-pass.dto';
import { NotificationService } from '../notification/notification.service';
import * as moment from 'moment';
import { CreateUserLoginDto } from './dto/create-user-login.dto';
import { projectName } from 'src/Utils/projectName';
import { AddressService } from '../address/address.service';

@Injectable()
export class UsersService {
  public constructor(
    private readonly repoService: RepositoryService,
    private readonly addressService: AddressService,
    private readonly emailService: EmailService,
    private readonly magicCodeService: MagicCodesService,
    private readonly notificationService: NotificationService,
  ) {}

  async getByEmail(email: string) {
    const user = await this.repoService.userRepo.findOne(
      { email },
      {
        select: [
          'id',
          'email',
          'name',
          'username',
          'password',
          'role',
          'typeuser',
          'status',
          'photo',
        ],
      },
    );
    if (user) {
      return user;
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'USER_NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async getByEmailExists(email: string) {
    const user = await this.repoService.userRepo.findOne({ email });
    if (user) {
      return user;
    } else {
      return 0;
    }
  }

  async updatePasswordVerify(password: string, id: string) {
    const newPassword = await bcrypt.hash(password, 10);

    const update = await this.repoService.userRepo.update(
      { id: id },
      { password: newPassword },
    );

    if (update) {
      return {
        status: true,
        message: 'OK',
      };
    }
  }

  async create(userData: CreateUserDto) {
    userData.password = await bcrypt.hash(userData.password, 10);
    userData.keyword = await this.keywordGenerator(
      userData.name,
      userData.email,
      userData.username,
    );

    const checkMail = await this.repoService.userRepo.findOne({
      email: userData.email,
    });

    if (checkMail) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error_code: 'ALREADY_EXISTS',
          message: 'Email already exists on system',
        },
        HttpStatus.CONFLICT,
      );
    }

    const checkUsername = await this.repoService.userRepo.findOne({
      username: userData.username,
    });

    if (checkUsername) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error_code: 'ALREADY_EXISTS',
          message: 'Username already exists on system',
        },
        HttpStatus.CONFLICT,
      );
    }

    const data = {
      ...userData,
      role: AdminType.NON_ADMIN,
      status: TypeStatus.INACTIVE,
      typeUser: TypeUser.USER,
    };

    const newUser = await this.repoService.userRepo.save(data);

    const token = await this.magicCodeService.create({
      one_time_use: true,
      type: 'verification_email',
      data: JSON.stringify(newUser.id),
    });

    const linkURL = await this.notificationService.createURL(
      'verification_email',
      token.code,
      newUser.id,
    );

    const content = 'verifikasi email';

    this.emailService.sendEmail(
      {
        email_recipient: userData.email,
        subject: 'Verifikasi Email',
        template_data: {
          link: linkURL,
          email_title: projectName,
          email_content:
            'Untuk melakukan ' + content + ' klik tombol dibawah ini',
        },
      },
      EmailTemplate.GENERAL,
    );

    return {
      name: newUser.name,
      email: newUser.email,
    };
  }

  async createAuth(userData: CreateUserLoginDto) {
    userData.password = await bcrypt.hash(userData.password, 10);
    userData.keyword = await this.keywordGenerator(
      userData.name,
      userData.email,
      userData.username,
    );

    if (userData.role == AdminType.SUPER_ADMIN) {
      const checkSU = await this.getSU();
      if (checkSU.length > 0) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error_code: 'UNAUTHORIZED',
            message: 'ALREADY_EXISTS_SUPER_ADMIN',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    const checkMail = await this.repoService.userRepo.findOne({
      email: userData.email,
    });

    if (checkMail) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error_code: 'ALREADY_EXISTS',
          message: 'Email already exists on system',
        },
        HttpStatus.CONFLICT,
      );
    }

    const checkUsername = await this.repoService.userRepo.findOne({
      username: userData.username,
    });

    if (checkUsername) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error_code: 'ALREADY_EXISTS',
          message: 'Username already exists on system',
        },
        HttpStatus.CONFLICT,
      );
    }

    const data = {
      ...userData,
      photo: '',
    };

    const newUser = await this.repoService.userRepo.save(data);

    const token = await this.magicCodeService.create({
      one_time_use: true,
      type: 'forget_password',
      data: JSON.stringify(newUser.id),
    });

    const linkURL = await this.notificationService.createURL(
      'reset_password',
      token.code,
      newUser.id,
    );

    const content = 'reset password';

    this.emailService.sendEmail(
      {
        email_recipient: userData.email,
        subject: 'Reset Password',
        template_data: {
          link: linkURL,
          email_title: projectName,
          email_content:
            'Untuk melakukan ' + content + ' klik tombol dibawah ini',
        },
      },
      EmailTemplate.GENERAL,
    );

    return newUser;
  }

  async update(id: string, data: UpdateUserDto) {
    try {
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
      }
      const admin = await this.repoService.userRepo.findOne({
        id: id,
      });

      const checkMail = await this.repoService.userRepo.findOne({
        email: data.email,
      });

      if (checkMail && admin.email != data.email) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            error_code: 'ALREADY_EXISTS',
            message: 'Email already exists on system',
          },
          HttpStatus.CONFLICT,
        );
      }

      const checkUsername = await this.repoService.userRepo.findOne({
        username: data.username,
      });

      if (checkUsername && admin.username != data.username) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            error_code: 'ALREADY_EXISTS',
            message: 'Username already exists on system',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (!admin) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error_code: 'NOT_FOUND',
            message: 'data not found on system',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const update = await this.repoService.userRepo.update(
        { id: id },
        {
          ...data,
          email: data.email.toLowerCase(),
          keyword: await this.keywordGenerator(
            data.name,
            data.email,
            data.username,
          ),
        },
      );

      if (update) {
        return {
          status: true,
          message: 'OK',
        };
      }

      return update;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async findAll(
    userLogin: string,
    options: IPaginationOptions,
    keyword: string,
    order_by: string,
    sort: string,
    status: string,
    role: string,
    typeuser: string,
    startDate: Date,
    endDate: Date,
  ) {
    switch (order_by) {
      case 'typeuser':
        order_by = 'user.typeuser';
        break;

      case 'created_at':
        order_by = 'user.created_at';
        break;

      case 'status':
        order_by = 'user.status';
        break;

      case 'name':
        order_by = 'LOWER(user.name)';
        break;

      case 'role':
        order_by = 'user.role';
        break;

      default:
        order_by = 'LOWER(user.name)';
        break;
    }

    let data = await this.repoService.userRepo
      .createQueryBuilder('user')
      .where('user.id != :id', { id: userLogin })
      .orderBy(order_by, sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');

    if (keyword) {
      data = await data.andWhere('user.name ILike :userName', {
        userName: '%' + keyword + '%',
      });
    }
    if (status) {
      data = await data.andWhere('user.status = :status', {
        status: status,
      });
    }
    if (role) {
      data = await data.andWhere('user.role = :role', {
        role: role,
      });
    }
    if (typeuser) {
      data = await data.andWhere('user.typeuser = :typeuser', {
        typeuser: typeuser,
      });
    }
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').subtract(7, 'hour');
      const end = moment(endDate).endOf('day').subtract(7, 'hour');
      data = data
        .andWhere('user.created_at > :start', {
          start,
        })
        .andWhere('user.created_at < :end', { end })
        .orderBy(
          'user.created_at',
          sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
        );
    }
    if ((await (await data.getMany()).length) > 0) {
      return paginate<Users>(data, options);
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'NOT_FOUND',
        message: 'filter does not match any data on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async search(userLogin: string, query: string) {
    const formattedQuery = query.trim().replace(/ /g, ' & ');
    const searchResult = await this.repoService.userRepo
      .createQueryBuilder('user')
      .where(`to_tsvector(user.keyword) @@ plainto_tsquery(:query)`, {
        query: formattedQuery,
      })
      .andWhere(`user.status = 'active'`)
      .andWhere('user.id != :id', { id: userLogin })
      .take(10)
      .getMany();
    if (searchResult.length > 0) {
      return searchResult;
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'USER_NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async findOne(id: string) {
    const user = await this.repoService.userRepo.findOne({ id });
    if (user) {
      user.password = undefined;
      return user;
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async findOneMe(id: string) {
    const user = await this.repoService.userRepo.findOne(
      { id },
      {
        select: ['email', 'name', 'username', 'password', 'photo'],
      },
    );

    const address = await this.addressService.myAddress(id);
    // .createQueryBuilder('users')
    // .leftJoinAndSelect('users.address', 'addressjoin')
    // .where('users.id = :id', { id })
    // .orderBy('addressjoin.created_at', 'DESC')
    // .getOne();

    if (user) {
      return {
        name: user.name,
        username: user.username,
        email: user.email,
        photo: user.photo,
        address: address,
        password: user.password,
      };
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async forgotPass(forgotUser: ForgotPassDto) {
    const user = await this.repoService.userRepo.findOne({
      where: { email: forgotUser.email.toLowerCase() },
    });

    if (user) {
      const token = await this.magicCodeService.create({
        one_time_use: true,
        type: 'forget_password',
        data: JSON.stringify(user.id),
      });

      const notifLink = await this.notificationService.createURL(
        'reset_password',
        token.code,
        user.id,
      );

      const content = 'reset password';

      await this.emailService.sendEmail(
        {
          email_recipient: forgotUser.email.toLowerCase(),
          subject: 'Forgot User Password',
          template_data: {
            email_content:
              'Untuk melakukan ' + content + ' klik tombol dibawah ini',
            link: notifLink,
            email_title: projectName,
          },
        },
        EmailTemplate.GENERAL,
      );
      return token;
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'EMAIL_NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async handlerChangePass(code, newPass: UpdatePassDto) {
    const tokenVerify = await this.magicCodeService.verify(code);
    if (!tokenVerify) {
      return {
        status: false,
        message: 'INVALID_CODE',
        data: null,
      };
    }

    const userData = JSON.parse(tokenVerify.data);
    if (!userData) {
      return {
        status: false,
        message: 'USER_NOT_FOUND',
        data: userData,
      };
    }

    if (newPass.password) {
      const hashedPassword = await bcrypt.hash(newPass.password, 10);
      newPass.password = hashedPassword;
    }

    const userInfo = await this.repoService.userRepo.findOne({
      where: { id: userData },
    });
    if (userInfo) {
      await this.repoService.userRepo.update(userData, {
        password: newPass.password,
      });
    }
    return {
      message: 'password has been changed successfully',
    };
  }

  async getRoleById(id: string) {
    const user = await this.repoService.userRepo.findOne(
      { id },
      {
        select: ['role'],
      },
    );
    if (user) {
      return user;
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'USER_NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async getuserId(id: string) {
    const user = await this.repoService.userRepo.findOne({ id });
    if (user) {
      return user;
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'USER_NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async getUser() {
    const user = this.repoService.userRepo.find({
      typeuser: TypeUser.USER,
      role: AdminType.NON_ADMIN,
      status: TypeStatus.ACTIVE,
    });

    return user;
  }

  async getSU() {
    const su = this.repoService.userRepo.find({
      role: AdminType.SUPER_ADMIN,
      status: TypeStatus.ACTIVE,
    });

    return su;
  }

  async getEmployee() {
    const employee = this.repoService.userRepo.find({
      typeuser: TypeUser.EMPLOYEE,
      role: AdminType.NON_ADMIN,
      status: TypeStatus.ACTIVE,
    });

    return employee;
  }

  async keywordGenerator(name: string, email: string, username: string) {
    if (username == null) {
      username = '';
    }
    const keyword = `${name} ${email} ${username} `;
    return keyword;
  }

  async getAllEmailUser(email) {
    const userList = await this.repoService.userRepo.findOne({ email });
    return userList;
  }

  async verifictionMail(code: string) {
    const verifyMail = await this.magicCodeService.verifyMail(code);
    const dataOne = verifyMail.data.replace('"', '');
    const id = dataOne.replace('"', '');
    const updateStatus = await this.repoService.userRepo.update(
      { id: id },
      { status: TypeStatus.ACTIVE },
    );

    if (updateStatus) {
      return {
        status: true,
        message: 'OK',
      };
    }

    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'CODE_EXPIRED',
        message: 'Code Expired',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
