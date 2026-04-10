import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { Public } from '../auth/public.decorator';
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

  @Public()
  @Get('public/:id/records')
  @ApiResponse({ status: 200, type: SharedLinkMedicalRecordsResponseDto })
  async getPublicSharedLinkRecords(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<SharedLinkMedicalRecordsResponseDto> {
    return this.sharedRecordsService.getSharedLinkRecordsForRecipient(id);
  }

  @Public()
  @Get('public/:id/records/:recordId/view')
  @ApiOperation({ summary: 'View a shared medical record by shared link ID' })
  @ApiParam({ name: 'id', description: 'UUID of the shared link' })
  @ApiParam({ name: 'recordId', description: 'UUID of the medical record' })
  async viewPublicSharedRecord(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName, mimeType } =
      await this.sharedRecordsService.getSharedRecordFileForRecipient(
        id,
        recordId,
      );

    const sanitizedFileName = fileName.replace(/["\\]/g, '_');
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${sanitizedFileName}"`,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(buffer);
  }

  @Public()
  @Get('public/:id/records/:recordId/download')
  @ApiOperation({
    summary: 'Download a shared medical record by shared link ID',
  })
  @ApiParam({ name: 'id', description: 'UUID of the shared link' })
  @ApiParam({ name: 'recordId', description: 'UUID of the medical record' })
  async downloadPublicSharedRecord(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName, mimeType } =
      await this.sharedRecordsService.getSharedRecordFileForRecipient(
        id,
        recordId,
      );

    const sanitizedFileName = fileName.replace(/["\\]/g, '_');
    res.attachment(sanitizedFileName);
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(buffer);
  }

  @Post(':id/records/add')
  @ApiOperation({ summary: 'Add medical records to a shared link' })
  @ApiParam({ name: 'id', description: 'UUID of the shared link' })
  @ApiResponse({ status: 200, type: SendSharedLinkResponseDto })
  async addRecordsToSharedLink(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { medicalRecordIds: string[] },
  ): Promise<SendSharedLinkResponseDto> {
    return this.sharedRecordsService.addRecordsToSharedLink(
      user.sub,
      id,
      body.medicalRecordIds,
    );
  }

  @Delete(':id/records/:recordId')
  @ApiOperation({ summary: 'Remove a medical record from a shared link' })
  @ApiParam({ name: 'id', description: 'UUID of the shared link' })
  @ApiParam({ name: 'recordId', description: 'UUID of the medical record' })
  @ApiResponse({ status: 200, type: SendSharedLinkResponseDto })
  async deleteRecordFromSharedLink(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('recordId', new ParseUUIDPipe({ version: '4' })) recordId: string,
  ): Promise<SendSharedLinkResponseDto> {
    return this.sharedRecordsService.deleteRecordFromSharedLink(
      user.sub,
      id,
      recordId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shared link' })
  @ApiParam({ name: 'id', description: 'UUID of the shared link' })
  @ApiResponse({ status: 200, type: SendSharedLinkResponseDto })
  async deleteSharedLink(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<SendSharedLinkResponseDto> {
    return this.sharedRecordsService.deleteSharedLink(user.sub, id);
  }
}
