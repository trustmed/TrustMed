import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BlockchainConnectorService } from './blockchain-connector.service';

@Module({
  imports: [HttpModule],
  providers: [BlockchainConnectorService],
  exports: [BlockchainConnectorService],
})
export class BlockchainModule {}
