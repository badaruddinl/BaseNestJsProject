import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Put,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@ApiTags('attachment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async createAttachment(
    @Body() attachment: CreateAttachmentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.attachmentService.createAttachment(files, attachment);
  }

  @Get()
  async getAllAttachment(
    @Query('keyword') keyword: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    const result = await this.attachmentService.getAllAttachment(
      {
        page,
        limit,
      },
      keyword,
    );
    return result;
  }

  @Delete('/cloudinary')
  getCloudinary() {
    return this.attachmentService.getAndDeleteCloudinary();
  }

  @Get(':id')
  getAttachmentByDocumentId(@Param('id') id: string) {
    return this.attachmentService.getAttachmentByDocumentId(String(id));
  }

  @Put(':id')
  async updateAttachment(
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ) {
    return this.attachmentService.updateAttachment(
      String(id),
      updateAttachmentDto,
    );
  }

  @Delete(':id')
  deleteAttachment(@Param('id') id: string) {
    return this.attachmentService.deleteAttachment(String(id));
  }
}
