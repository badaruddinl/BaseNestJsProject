import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMagicCodeDto } from './dto/create-magic-code.dto';
import { UpdateMagicCodeDto } from './dto/update-magic-code.dto';
import * as randomstring from 'randomstring';
import * as momentjs from 'moment';
import { RepositoryService } from 'src/models/repository/repository.service';
import { Code } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MagicCodesService {
  public constructor(private readonly repoService: RepositoryService) {}

  async create(payloads: CreateMagicCodeDto) {
    const code = randomstring.generate({
      length: 24,
      charset: 'alphanumeric',
    });

    const magicCode = await this.repoService.magicCodeRepo.save({
      code: code,
      one_time_use: payloads.one_time_use,
      type: payloads.type,
      data: payloads.data,
    });
    return magicCode;
  }

  async verify(code) {
    const verify = await this.repoService.magicCodeRepo.findOne({
      code,
    });

    // is data still exist
    if (!verify) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'CODE_NOT_FOUND',
          message: 'data not found on system',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // if is onetime use and already used
    if (verify.one_time_use && verify.status == 'used') {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'CODE_EXPIRED',
          message: 'Code Expired',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // if already expired
    if (
      momentjs(verify.created_at).subtract(7, 'hour') <
      momentjs().subtract(process.env.EXPIRED_MAGIC_CODE, 'day')
    ) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'CODE_EXPIRED',
          message: 'Code Expired',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (verify.one_time_use) {
      this.repoService.magicCodeRepo.update(
        { id: verify.id },
        { status: 'used' },
      );

      this.repoService.magicCodeRepo.softDelete({ id: verify.id });
    }

    return {
      data: verify.data,
      message: 'SUCCESS',
      status: true,
    };
  }

  async verifyMail(code) {
    const verify = await this.repoService.magicCodeRepo.findOne({
      code,
    });

    // is data still exist
    if (!verify) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'CODE_NOT_FOUND',
          message: 'data not found on system',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // if is onetime use and already used
    if (verify.one_time_use && verify.status == 'used') {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'CODE_EXPIRED',
          message: 'Code Expired',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // if is onetime use and already used
    if (verify.type != 'verification_email') {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'CODE_NOT_FOUND ',
          message: 'data not found on system',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // if already expired
    if (
      momentjs(verify.created_at).subtract(7, 'hour') <
      momentjs().subtract(process.env.EXPIRED_MAGIC_CODE, 'day')
    ) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'CODE_EXPIRED',
          message: 'Code Expired',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (verify.one_time_use) {
      this.repoService.magicCodeRepo.update(
        { id: verify.id },
        { status: 'used' },
      );

      this.repoService.magicCodeRepo.softDelete({ id: verify.id });
    }

    return {
      data: verify.data,
      message: 'SUCCESS',
      status: true,
    };
  }
}
