import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

import { Response } from 'express';
@Controller('healthcheck')
export class HealthcheckController {
  @Get('')
  async getProduct(@Res() res: Response) {
    return res.status(HttpStatus.OK).send({
      message: 'SUCCESS',
    });
  }
}
