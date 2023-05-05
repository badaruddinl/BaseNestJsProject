import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MediaService {
  constructor(private cloudinary: CloudinaryService) {}

  async upload(file: Express.Multer.File) {
    return await this.cloudinary.uploadImage(file).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });
  }
  async uploads(files: Array<Express.Multer.File>) {
    const result = [];
    for (const file of files) {
      const upload = await this.cloudinary.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type.');
      });
      result.push(upload);
    }
    return result;
  }
}
