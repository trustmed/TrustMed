import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { ConsentService } from './consent.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { AcceptConsentDto } from './dto/consent-request.dto';
import { ConsentRequest } from '../entities/consent-request.entity';

@ApiTags('consent-requests')
@Controller('consent-requests')
export class ConsentRequestsController {
  constructor(
    private readonly consentService: ConsentService,
    @InjectRepository(AuthUser)
    private readonly authUserRepo: Repository<AuthUser>,
  ) {}

  private async resolveAuthUserId(clerkUserId: string): Promise<string> {
    const authUser = await this.authUserRepo.findOne({
      where: { clerkUserId },
    });
    if (!authUser) {
      throw new NotFoundException('Auth user not found');
    }
    return authUser.id;
  }

  @Post(':recordId')
  @ApiOperation({ summary: 'Request access to a specific medical record' })
  async requestAccess(
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest> {
    const requesterId = await this.resolveAuthUserId(user.sub);
    return this.consentService.requestAccess(requesterId, recordId);
  }

  @Get('me/received')
  @ApiOperation({ summary: 'Get consent requests received by the patient' })
  async getReceivedRequests(
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest[]> {
    const patientId = await this.resolveAuthUserId(user.sub);
    return this.consentService.getReceivedRequests(patientId);
  }

  @Get('me/sent')
  @ApiOperation({
    summary: 'Get consent requests sent by the requester (doctor/hospital)',
  })
  async getSentRequests(
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest[]> {
    const requesterId = await this.resolveAuthUserId(user.sub);
    return this.consentService.getSentRequests(requesterId);
  }

  @Patch(':id/accept')
  @ApiOperation({
    summary: 'Accept a consent request with a specific duration',
  })
  async acceptRequest(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AcceptConsentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest> {
    const patientId = await this.resolveAuthUserId(user.sub);
    return this.consentService.acceptRequest(id, patientId, dto.duration);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a consent request' })
  async rejectRequest(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ConsentRequest> {
    const patientId = await this.resolveAuthUserId(user.sub);
    return this.consentService.rejectRequest(id, patientId);
  }
}
