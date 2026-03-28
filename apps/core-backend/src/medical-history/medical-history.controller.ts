import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtCookieGuard } from '../auth/jwt-cookie.guard';
import { MedicalHistoryService } from './medical-history.service';
import { ProfileService } from '../profile/profile.service';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { MedicalHistoryResponseDto } from './dto/history-event.dto';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@ApiTags('Medical History')
@ApiBearerAuth()
@UseGuards(JwtCookieGuard)
@Controller('medical-history')
export class MedicalHistoryController {
  constructor(
    private readonly medicalHistoryService: MedicalHistoryService,
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'getHistory',
    summary: 'Get audit-log & blockchain history for the authenticated patient',
  })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Returns the medical history for the authenticated patient',
    type: MedicalHistoryResponseDto,
  })
  async getHistory(
    @Request() req: RequestWithUser,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
  ): Promise<MedicalHistoryResponseDto> {
    let personId: string | undefined = req.user.personId;

    if (!personId && req.user.sub) {
      // Resolve personId from authUserId for active sessions missing it in JWT
      personId = await this.profileService.getPersonIdByAuthUserId(
        req.user.sub,
      );
    }

    return this.medicalHistoryService.getHistory(personId || '', sort);
  }
}
