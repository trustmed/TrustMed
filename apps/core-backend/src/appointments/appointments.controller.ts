import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from '../entities/appointment.entity';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, type: Appointment })
  create(
    @Req() req: Request & { user?: { sub?: string } },
    @Body() dto: CreateAppointmentDto,
  ) {
    const clerkUserId = req.user?.sub;
    return this.appointmentsService.createForUser(clerkUserId as string, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments for the logged-in user' })
  @ApiResponse({ status: 200, type: [Appointment] })
  findAll(@Req() req: Request & { user?: { sub?: string } }) {
    const clerkUserId = req.user?.sub;
    return this.appointmentsService.findAllForUser(clerkUserId as string);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single appointment by ID' })
  @ApiResponse({ status: 200, type: Appointment })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment by ID' })
  @ApiResponse({ status: 200, type: Appointment })
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment by ID' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string) {
    await this.appointmentsService.remove(id);
    return { success: true };
  }
}

