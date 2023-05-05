import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
// This is a hack to make Multer available in the Express namespace
// import { Multer } from 'multer';

import * as dotenv from 'dotenv';
dotenv.config();

const AppMode = process.env.APP_MODE ? process.env.APP_MODE : 'OTHERS';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadPath =
        'projectname/' + AppMode.toString().toLocaleLowerCase();
      const upload = v2.uploader.upload_stream(
        {
          folder: uploadPath,
          resource_type: 'auto',
          filename_override: file.originalname,
          use_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  //resource_type is either 'image', 'raw' or 'video'
  async getAllResources(resource_type: string) {
    const result = await v2.api.resources({
      resource_type: resource_type,
      type: 'upload',
      max_results: 100,
    });
    return result;
  }

  async deleteResources(public_id) {
    const result = await v2.api.delete_resources(public_id, {
      type: 'upload',
    });
    return result;
  }
}
