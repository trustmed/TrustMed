import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { CoreProxyService } from '../core-proxy/core-proxy.service.js';

@ApiTags('consent-requests')
@Controller('consent-requests')
export class ConsentRequestsController {
  constructor(private readonly coreProxy: CoreProxyService) {}

  @Post(':recordId')
  @ApiOperation({ summary: 'Request access to a specific medical record' })
  async requestAccess(
    @Param('recordId') recordId: string,
    @Req() req: Request,
  ) {
    const result = await this.coreProxy.forward(
      'POST',
      `/consent-requests/${recordId}`,
      { cookies: req.headers.cookie || '' },
    );
    return result.data;
  }

  @Get('me/sent')
  @ApiOperation({ summary: 'Get consent requests sent by the doctor' })
  async getSentRequests(@Req() req: Request) {
    const result = await this.coreProxy.forward(
      'GET',
      '/consent-requests/me/sent',
      { cookies: req.headers.cookie || '' },
    );
    return result.data;
  }

  @Get('me/received')
  @ApiOperation({ summary: 'Get consent requests received (for patient view)' })
  async getReceivedRequests(@Req() req: Request) {
    const result = await this.coreProxy.forward(
      'GET',
      '/consent-requests/me/received',
      { cookies: req.headers.cookie || '' },
    );
    return result.data;
  }

  @Get(':recordId')
  @ApiOperation({ summary: 'Check request status and get download URL' })
  async getStatusAndDownload(
    @Param('recordId') recordId: string,
    @Req() req: Request,
  ) {
    const result = await this.coreProxy.forward(
      'GET',
      `/consent-requests/${recordId}`,
      { cookies: req.headers.cookie || '' },
    );
    return result.data;
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept a consent request' })
  async acceptRequest(
    @Param('id') id: string,
    @Body() body: { duration: string },
    @Req() req: Request,
  ) {
    const result = await this.coreProxy.forward(
      'PATCH',
      `/consent-requests/${id}/accept`,
      { cookies: req.headers.cookie || '', data: body },
    );
    return result.data;
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a consent request' })
  async rejectRequest(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const result = await this.coreProxy.forward(
      'PATCH',
      `/consent-requests/${id}/reject`,
      { cookies: req.headers.cookie || '' },
    );
    return result.data;
  }
}
