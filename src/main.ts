import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as dotenv from 'dotenv';
import { projectName } from './Utils/projectName';
dotenv.config();

async function bootstrap() {
  const logger = new Logger('NestApplication');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({}));

  if (process.env.APP_MODE == 'DEV') {
    const swaggerConfig = new DocumentBuilder()
      .addBearerAuth()
      .setTitle(projectName)
      .setVersion('0.0.1')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  app.enableCors({
    origin: ['http://localhost:3000', /localhost/],
    // methods: ["GET", "POST"],
    credentials: true,
  });
  await app.listen(process.env.APP_PORT || 3000);
  logger.log('Running at http://localhost:' + process.env.APP_PORT);
  logger.log('Swagger at http://localhost:' + process.env.APP_PORT + '/api');
}
bootstrap();
