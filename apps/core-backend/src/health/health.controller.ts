import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

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
}
