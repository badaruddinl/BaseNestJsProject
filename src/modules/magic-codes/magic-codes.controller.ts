import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MagicCodesService } from './magic-codes.service';
import { CreateMagicCodeDto } from './dto/create-magic-code.dto';
import { UpdateMagicCodeDto } from './dto/update-magic-code.dto';

@Controller('magic-codes')
export class MagicCodesController {
  constructor(private readonly magicCodesService: MagicCodesService) {}

  // @Post()
  // create(@Body() createMagicCodeDto: CreateMagicCodeDto) {
  //   return this.magicCodesService.create(createMagicCodeDto);
  // }

  // @Get()
  // findAll() {
  //   return this.magicCodesService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.magicCodesService.verify(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMagicCodeDto: UpdateMagicCodeDto) {
  //   return this.magicCodesService.update(+id, updateMagicCodeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.magicCodesService.remove(+id);
  // }
}
