import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Res,
  Request,
  UseGuards,
  ValidationPipe,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminType, TypeUser } from 'src/models/entities/users.entity';
import { TypeStatus } from 'src/models/entities/users.entity';
import { validationRole, validationRoleUpdate } from 'src/Utils/validationRole';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: 'keyword',
    required: false,
  })
  @ApiQuery({
    name: 'order_by',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    required: false,
  })
  @ApiQuery({
    name: 'role',
    required: false,
  })
  @ApiQuery({
    name: 'typeuser',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  async findAll(
    @Query('keyword') keyword: string,
    @Query('order_by', new DefaultValuePipe('name')) order_by: string,
    @Query('sort', new DefaultValuePipe('ASC')) sort: string,
    @Query('status', new DefaultValuePipe('')) status: TypeStatus,
    @Query('role', new DefaultValuePipe('')) role: AdminType,
    @Query('typeuser', new DefaultValuePipe('')) typeuser: TypeUser,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    const UserLoggedIn = req.user;
    const result = await this.userService.findAll(
      UserLoggedIn.id,
      {
        page,
        limit,
      },
      keyword,
      order_by,
      sort,
      status,
      role,
      typeuser,
      startDate,
      endDate,
    );
    return result;
  }

  @Get('/search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: 'search',
    required: false,
  })
  async search(
    @Query('search', new DefaultValuePipe('')) query: string,
    @Request() req,
  ) {
    const UserLoggedIn = req.user;
    return await this.userService.search(UserLoggedIn.id, query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    const UserLoggedIn = req.user;
    if (id == 'me' || id == UserLoggedIn.id) {
      return this.userService.findOneMe(UserLoggedIn.id);
    }
    return this.userService.findOne(id);
  }

  @Patch('changepass/:code')
  async handlerChangePass(
    @Param('code') code: string,
    @Body() updatePassDto: UpdatePassDto,
  ) {
    return this.userService.handlerChangePass(code, updatePassDto);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateMe(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    const UserLoggedIn = req.user;
    updateUserDto.role = UserLoggedIn.role;
    updateUserDto.typeuser = UserLoggedIn.typeuser;
    delete updateUserDto.status;
    return this.userService.update(UserLoggedIn.id, updateUserDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN || Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const UserLoggedIn = req.user;
    const targetUserRole = await this.userService.getRoleById(id);
    await validationRoleUpdate(UserLoggedIn.role, targetUserRole.role);
    await validationRole(UserLoggedIn.role, updateUserDto);
    return await this.userService.update(id, updateUserDto);
  }

  @Post('forgotpass')
  async forgotPass(@Body() forgotPassword: ForgotPassDto) {
    return this.userService.forgotPass(forgotPassword);
  }

  @Post('verifymail/:code')
  async verrifyMail(@Param('code') code: string) {
    return this.userService.verifictionMail(code);
  }
}
