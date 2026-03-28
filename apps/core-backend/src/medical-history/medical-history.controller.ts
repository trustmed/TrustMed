import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtCookieGuard } from '../auth/jwt-cookie.guard';
import { MedicalHistoryService } from './medical-history.service';
import { MedicalHistoryResponseDto } from './dto/history-event.dto';

@ApiTags('Medical History')
@ApiBearerAuth()
@UseGuards(JwtCookieGuard)
@Controller('medical-history')
export class MedicalHistoryController {
    constructor(private readonly medicalHistoryService: MedicalHistoryService) { }

    @Get()
    @ApiOperation({
        operationId: 'getHistory',
        summary: 'Get audit-log & blockchain history for the authenticated patient' })
    @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({
        status: 200,
        description: 'Returns the medical history for the authenticated patient',
        type: MedicalHistoryResponseDto,
    })
    async getHistory(
        @Request() req: any,
        @Query('sort') sort: 'asc' | 'desc' = 'desc',
    ): Promise<MedicalHistoryResponseDto> {
        const personId = req.user.personId;
        return this.medicalHistoryService.getHistory(personId, sort);
    }
}
