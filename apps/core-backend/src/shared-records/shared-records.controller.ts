import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { SharedRecordsService } from './shared-records.service';
import { SharedRecordsResponseDto } from './dto/shared-records-response.dto';

@ApiTags('shared-records')
@Controller('shared-records')
export class SharedRecordsController {
  constructor(private readonly sharedRecordsService: SharedRecordsService) {}

  @Get('me')
  @ApiResponse({ status: 200, type: SharedRecordsResponseDto })
  async getSharedRecordsForMe(
    @CurrentUser() user: JwtPayload,
  ): Promise<SharedRecordsResponseDto> {
    return this.sharedRecordsService.getSharedRecordsForUser(user.sub);
  }
}
