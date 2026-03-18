import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccessService } from './access.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { ApproveAccessRequestDto } from './dto/approve-access-request.dto';
import { Public } from '../auth/public.decorator';

@Controller('access-requests')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Public()
  @Post()
  async create(@Body() body: CreateAccessRequestDto) {
    try {
      return await this.accessService.createRequest(body);
    } catch (error) {
      console.error('Create Request Error:', error);
      throw new InternalServerErrorException({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Public()
  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: ApproveAccessRequestDto,
  ) {
    try {
      return await this.accessService.approveRequest(id, body.expiresAt);
    } catch (error) {
      console.error('Approve Request Error:', error);
      throw new InternalServerErrorException({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Public()
  @Get(':id/check')
  async check(@Param('id') id: string) {
    try {
      return await this.accessService.checkAccess(id);
    } catch (error) {
      console.error('Check Access Error:', error);
      throw new InternalServerErrorException({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
