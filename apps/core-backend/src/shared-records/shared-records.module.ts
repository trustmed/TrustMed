import { Module } from '@nestjs/common';
import { SharedRecordsController } from './shared-records.controller';
import { SharedRecordsService } from './shared-records.service';

@Module({
  controllers: [SharedRecordsController],
  providers: [SharedRecordsService],
  exports: [SharedRecordsService],
})
export class SharedRecordsModule {}
