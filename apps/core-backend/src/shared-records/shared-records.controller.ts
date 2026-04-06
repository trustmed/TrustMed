import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { SharedRecordsService } from './shared-records.service';
import {
  SharedRecordsResponseDto,
  SharedLinkMedicalRecordsResponseDto,
} from './dto/shared-records-response.dto';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';
import { SendSharedLinkResponseDto } from './dto/send-shared-link-response.dto';

@ApiTags('shared-records')
@Controller('shared-records')
export class SharedRecordsController {
  constructor(private readonly sharedRecordsService: SharedRecordsService) {}

  @Post('send-link')
  @ApiResponse({ status: 201, type: SendSharedLinkResponseDto })
  async sendSharedRecords(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateSharedLinkDto,
  ): Promise<SendSharedLinkResponseDto> {
    return this.sharedRecordsService.sendSharedRecords(user.sub, body);
  }

  @Get('me')
  @ApiResponse({ status: 200, type: SharedRecordsResponseDto })
  async getSharedRecordsForMe(
    @CurrentUser() user: JwtPayload,
  ): Promise<SharedRecordsResponseDto> {
    return this.sharedRecordsService.getSharedRecordsForUser(user.sub);
  }

  @Get(':id/records')
  @ApiResponse({ status: 200, type: SharedLinkMedicalRecordsResponseDto })
  async getSharedLinkRecords(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<SharedLinkMedicalRecordsResponseDto> {
    return this.sharedRecordsService.getSharedLinkRecordsForUser(user.sub, id);
  }
}
