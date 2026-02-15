import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthResponse } from './health.service';
import { Public } from '../auth/public.decorator';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check application health and database status' })
  @ApiResponse({
    status: 200,
    description: 'Application health status with database connection info',
  })
  async checkHealth(): Promise<HealthResponse> {
    return this.healthService.getHealth();
  }
}
