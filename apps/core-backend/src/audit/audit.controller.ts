import { Controller, Get, Param } from '@nestjs/common';
import { BlockchainConnectorService } from '../blockchain/blockchain-connector.service';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('audit')
export class AuditController {
  constructor(
    private readonly blockchainConnector: BlockchainConnectorService,
  ) {}

  @Get('blockchain/:patientDid')
  async getBlockchainLogs(@Param('patientDid') patientDid: string) {
    return this.blockchainConnector.getAuditHistory(patientDid);
  }
}
