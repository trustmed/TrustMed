import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';

@Module({
  imports: [BlockchainModule],
  controllers: [AccessController],
  providers: [AccessService],
})
export class AccessModule {}
