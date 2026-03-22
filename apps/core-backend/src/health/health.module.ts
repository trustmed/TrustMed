import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { BlockchainConnectorService } from 'src/blockchain/blockchain-connector.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([]), HttpModule],
  controllers: [HealthController],
  providers: [HealthService, BlockchainConnectorService],
})
export class HealthModule {}
