import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, type: AppointmentResponseDto })
  async create(
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    console.log('Received appointment creation request:', dto);
    const a = await this.appointmentsService.create(dto);
    return {
      id: a.id,
      appointmentNo: a['appointmentNo'] || '',
      appointmentType: a['type'] || '',
      doctorName: a['doctor'] || '',
      date: a.date instanceof Date ? a.date.toISOString().slice(0, 10) : a.date,
      hospitalLocation: a['location'] || '',
      status: a.status,
      address: a['address'] || '',
      phone: a['phone'] || '',
      email: a['email'] || '',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List all appointments for a person by auth user id',
  })
  @ApiResponse({ status: 200, type: Object })
  async findAllByAuthUserId(
    @Query('authUserId') authUserId: string,
  ): Promise<{ records: AppointmentResponseDto[] }> {
    const records =
      await this.appointmentsService.findAllByAuthUserId(authUserId);
    console.log(
      'Retrieved appointments for authUserId',
      authUserId,
      ':',
      records,
    );
    return { records };
  }
}
