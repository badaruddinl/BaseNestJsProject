import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { NotificationModule } from '../notification/notification.module';
import { MagicCodesModule } from '../magic-codes/magic-codes.module';
import { AddressModule } from '../address/address.module';
import { AddressService } from '../address/address.service';

@Module({
  imports: [NotificationModule, MagicCodesModule],
  controllers: [UsersController],
  providers: [UsersService, AddressService],
  exports: [UsersService],
})
export class UsersModule {}
