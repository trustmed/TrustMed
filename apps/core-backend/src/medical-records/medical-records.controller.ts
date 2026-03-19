import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { MedicalRecordsService } from './medical-records.service';
import { RecordListItemDto } from './dto/record-list-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { NotFoundException } from '@nestjs/common';

@ApiTags('medical-records')
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    @InjectRepository(AuthUser)
    private readonly authUserRepo: Repository<AuthUser>,
  ) {}

  /**
   * Resolves the Clerk user ID from the JWT payload to the internal
   * `AuthUser.id` UUID used throughout the data model.
   */
  private async resolveAuthUserId(clerkUserId: string): Promise<string> {
    const authUser = await this.authUserRepo.findOne({
      where: { clerkUserId },
    });
    if (!authUser) {
      throw new NotFoundException('Auth user not found');
    }
    return authUser.id;
  }

  /**
   * List all medical records belonging to the authenticated user.
   * Returns metadata only — keys and S3 URIs are never exposed.
   */
  @Get('me')
  @ApiOperation({ summary: 'List my medical records (metadata only)' })
  async listMyRecords(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<RecordListItemDto[]> {
    const authUserId = await this.resolveAuthUserId(user.sub);
    return this.medicalRecordsService.listMyRecords(authUserId, req.ip);
  }

  /**
   * Decrypt and download a medical record.
   * Verifies consent (owner / authorized party) before streaming.
   */
  @Get(':id/download')
  @ApiOperation({
    summary: 'Download a decrypted medical record (consent required)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the medical record',
  })
  async downloadRecord(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const authUserId = await this.resolveAuthUserId(user.sub);

    const { buffer, originalFileName, mimeType } =
      await this.medicalRecordsService.downloadRecord(id, authUserId, req.ip);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(originalFileName)}"`,
      'Content-Length': buffer.length.toString(),
    });

    return new StreamableFile(buffer);
  }
}
