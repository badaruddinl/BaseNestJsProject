import { Module } from '@nestjs/common';
import { MagicCodesService } from './magic-codes.service';
import { MagicCodesController } from './magic-codes.controller';

@Module({
  controllers: [MagicCodesController],
  providers: [MagicCodesService],
  exports: [MagicCodesService],
})
export class MagicCodesModule {}
