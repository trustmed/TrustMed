import { Controller, Get, Query, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { CoreProxyService } from '../core-proxy/core-proxy.service.js';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly coreProxy: CoreProxyService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for a patient by name or email via core-backend' })
  @ApiQuery({ name: 'query', type: 'string', required: true })
  async searchPatients(
    @Query('query') query: string,
    @Req() req: Request,
  ) {
    if (!query) {
      throw new NotFoundException('Query parameter is required');
    }

    try {
      const result = await this.coreProxy.forward('GET', '/medical-records/search', {
        cookies: req.headers.cookie || '',
        params: { query },
      });
      return result.data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        throw new NotFoundException('No patients found matching this query');
      }
      throw error;
    }
  }
}
