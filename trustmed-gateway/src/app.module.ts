import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain/blockchain.controller';
import { AuditController } from './blockchain/audit.controller';
import { BlockchainService } from './blockchain/blockchain.service';

@Module({
    imports: [],
    controllers: [BlockchainController, AuditController],
    providers: [BlockchainService],
})
export class AppModule { }
