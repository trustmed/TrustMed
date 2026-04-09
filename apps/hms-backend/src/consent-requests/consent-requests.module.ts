import { Module } from '@nestjs/common';
import { ConsentRequestsController } from './consent-requests.controller.js';

@Module({
  controllers: [ConsentRequestsController],
})
export class ConsentRequestsModule {}
