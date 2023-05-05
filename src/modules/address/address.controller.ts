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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('address')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createAddressDto: CreateAddressDto, @Req() req) {
    const UserLoggedIn = req.user;
    const datas = {
      user_id: UserLoggedIn.id,
      address: createAddressDto.address,
      city: createAddressDto.city,
      province: createAddressDto.province,
      country: createAddressDto.country,
      zipcode: createAddressDto.zipcode,
      phone: createAddressDto.phone,
    };
    return await this.addressService.createMyAddress(datas);
  }

  @Get('/getAllMy')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getmyAllAddress(@Req() req) {
    const UserLoggedIn = req.user;
    return await this.addressService.myAllAddress(UserLoggedIn.id);
  }

  @Get('getAll')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAllAddress() {
    return await this.addressService.getAddressAll();
  }

  @Get('/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAddressById(@Req() req, @Param('id') id: string) {
    return await this.addressService.getAddressById(id);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateMyaddress(
    @Body() UpdateAddressDto: UpdateAddressDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const UserLoggedIn = req.user;
    return await this.addressService.update(
      UpdateAddressDto,
      id,
      UserLoggedIn.id,
    );
  }

  @Patch('/set-default/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateDefault(@Param('id') id: string, @Req() req) {
    const UserLoggedIn = req.user;
    return await this.addressService.setDefault(id, UserLoggedIn.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req) {
    const UserLoggedIn = req.user;
    return await this.addressService.delete(id, UserLoggedIn.id);
  }
}
