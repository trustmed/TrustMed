import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import {
  BlockchainHealthResponseDto,
  HealthResponseDto,
} from './dto/health-response.dto';
import { Public } from '../auth/public.decorator';
import { BlockchainConnectorService } from 'src/blockchain/blockchain-connector.service';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly blockchainConnectorService: BlockchainConnectorService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'getHealth',
    summary: 'Check application health and database status',
  })
  @ApiResponse({
    status: 200,
    description: 'Application health status with database connection info',
    type: HealthResponseDto,
  })
  async checkHealth(): Promise<HealthResponseDto> {
    return this.healthService.getHealth();
  }

  @Get('blockchainhealth')
  @ApiOperation({
    operationId: 'getBlockchainHealth',
    summary: 'Get Blockchain network health',
  })
  @ApiResponse({
    status: 200,
    description: 'Blockchain network health status',
    type: BlockchainHealthResponseDto,
  })
  async getBlockchainHealth() {
    return this.blockchainConnectorService.checkGatewayHealth();
  }
}
