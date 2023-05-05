import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TypeStatusBanks } from 'src/models/entities/bank.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BanksService } from './banks.service';
import { CreateBanksDto } from './dto/create-banks.dto';
import { NewCreateBanksDto } from './dto/new-create-banks.dto';
import { UpdateBanksDto } from './dto/update-banks.dto';

@ApiTags('banks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get('getAll')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAllAddress(@Req() req) {
    const UserLoggedIn = req.user;
    return await this.banksService.myAllBanks(UserLoggedIn.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(@Body() CreateBanksDto: CreateBanksDto, @Req() req) {
    const UserLoggedIn = req.user;
    const payload: NewCreateBanksDto = {
      ...CreateBanksDto,
      user_id: UserLoggedIn.id,
      status: TypeStatusBanks.ACTIVE,
      isDefault: false,
    };
    return await this.banksService.createMyBanks(payload);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() payload: UpdateBanksDto,
    @Param(':id') id: string,
    @Req() req,
  ) {
    const UserLoggedIn = req.user;
    return await this.banksService.update(payload, id, UserLoggedIn.id);
  }

  @Patch('/set-default/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async setDefault(@Param(':id') id: string, @Req() req) {
    const UserLoggedIn = req.user;
    return await this.banksService.setDefault(id, UserLoggedIn.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req) {
    const UserLoggedIn = req.user;
    return await this.banksService.delete(id, UserLoggedIn.id);
  }
}
