import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import ormconfig from './config/ormconfig';
import { RepositoryModule } from './models/repository/repository.module';
import { AuthModule } from './modules/auth/auth.module';
import { MagicCodesModule } from './modules/magic-codes/magic-codes.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { MediaModule } from './modules/media/media.module';
import { AttachmentModule } from './modules/attachment/attachment.module';
// import { AddressController } from './modules/address/address.controller';
// import { AddressService } from './modules/address/address.service';
import { AddressModule } from './modules/address/address.module';
import { BanksController } from './modules/banks/banks.controller';
import { BanksService } from './modules/banks/banks.service';
import { BanksModule } from './modules/banks/banks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    RepositoryModule,
    UsersModule,
    AuthModule,
    MagicCodesModule,
    NotificationModule,
    AuthModule,
    AttachmentModule,
    CloudinaryModule,
    MediaModule,
    AddressModule,
    BanksModule,
  ],
  controllers: [AppController, BanksController],
  providers: [AppService, BanksService],
})
export class AppModule {}
