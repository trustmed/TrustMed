import { Controller, Get, Query, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { CoreProxyService } from '../core-proxy/core-proxy.service.js';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly coreProxy: CoreProxyService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for a patient by email via core-backend' })
  @ApiQuery({ name: 'email', type: 'string', required: true })
  async searchByEmail(
    @Query('email') email: string,
    @Req() req: Request,
  ) {
    if (!email) {
      throw new NotFoundException('Email query parameter is required');
    }

    try {
      const result = await this.coreProxy.forward('GET', '/medical-records/search', {
        cookies: req.headers.cookie || '',
        params: { email },
      });
      return result.data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        throw new NotFoundException('No patient found with this email');
      }
      throw error;
    }
  }
}
