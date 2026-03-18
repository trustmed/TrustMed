import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccessService } from './access.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { ApproveAccessRequestDto } from './dto/approve-access-request.dto';

@Controller('access-requests')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post()
  create(@Body() body: CreateAccessRequestDto) {
    return this.accessService.createRequest(body);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: ApproveAccessRequestDto) {
    return this.accessService.approveRequest(id, body.expiresAt);
  }

  @Get(':id/check')
  check(@Param('id') id: string) {
    return this.accessService.checkAccess(id);
  }
}
