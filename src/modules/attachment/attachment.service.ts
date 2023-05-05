import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Attachment } from 'src/models/entities/attachment.entity';
import { RepositoryService } from 'src/models/repository/repository.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@Injectable()
export class AttachmentService {
  public constructor(
    private readonly repoService: RepositoryService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getAndDeleteCloudinary() {
    try {
      const rscImage = await this.cloudinary.getAllResources('image');
      const rscRaw = await this.cloudinary.getAllResources('raw');
      const dataAttachment = await this.repoService.attachmentRepo
        .createQueryBuilder('attachment')
        .getMany();
      const dataUserPhoto = await this.repoService.userRepo
        .createQueryBuilder('user')
        .getMany();
      const attachmentUrl = [];
      await dataAttachment.forEach(async (data) => {
        if (data.url) {
          await attachmentUrl.push(data.url);
        }
      });
      await dataUserPhoto.forEach(async (data) => {
        if (data.photo) {
          await attachmentUrl.push(data.photo);
        }
      });
      const deletedRsc = [];
      await rscImage.resources.forEach(async (data) => {
        if (!attachmentUrl.includes(data.secure_url)) {
          await deletedRsc.push(data.public_id);
        }
      });
      await rscRaw.resources.forEach(async (data) => {
        if (!attachmentUrl.includes(data.secure_url)) {
          await deletedRsc.push(data.public_id);
        }
      });
      return await this.cloudinary.deleteResources(deletedRsc);
    } catch (error) {
      throw new HttpException('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
  }

  async createAttachment(
    files: Array<Express.Multer.File>,
    payloads: CreateAttachmentDto,
  ) {
    const result = [];
    for (const file of files) {
      const upload = await this.cloudinary.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type.');
      });
      upload.name = file.originalname;
      await result.push(upload);
    }

    result.forEach(async (fileData) => {
      await this.repoService.attachmentRepo.save({
        document_id: payloads.document_id,
        document_type: payloads.document_type,
        name: fileData.name,
        url: fileData.secure_url,
      });
    });
    return {
      status: 'OK',
      message: 'file has been uploaded',
    };
  }

  async getAllAttachment(options: IPaginationOptions, keyword: string) {
    const data = await this.repoService.attachmentRepo.createQueryBuilder(
      'attachment',
    );
    return paginate<Attachment>(data, options);
  }

  async getAttachmentByDocumentId(id: string) {
    const attachment = await this.repoService.attachmentRepo.find({
      where: { document_id: id },
    });
    if (attachment) {
      return attachment;
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'ATTACHMENT_NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async updateAttachment(id: string, payloads: UpdateAttachmentDto) {
    await this.repoService.attachmentRepo.update(id, payloads);
    const updateAttachment = await this.repoService.attachmentRepo.findOne({
      where: { id },
    });
    if (updateAttachment) {
      return updateAttachment;
    }
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'ATTACHMENT_NOT_FOUND',
        message: 'data not found on system',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async deleteAttachment(id: string) {
    const deleteAttachment = await this.repoService.attachmentRepo.delete(id);
    if (!deleteAttachment.affected) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'NOT_FOUND',
          message: 'data not found on system',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
