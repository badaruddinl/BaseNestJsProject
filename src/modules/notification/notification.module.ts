import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { NotificationService } from './notification.service';
@Module({
  imports: [],
  providers: [EmailService, NotificationService],
  exports: [EmailService, NotificationService],
})
export class NotificationModule {}
