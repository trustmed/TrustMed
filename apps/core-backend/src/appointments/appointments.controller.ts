import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { EditAppointmentDto } from './dto/edit-appointment.dto';
import { DeleteAppointmentDto } from './dto/delete-appointment.dto';
import { FindAppointmentByIdDto } from './dto/find-appointment-by-id.dto';

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
    return { records };
  }

  @Get('find')
  @ApiOperation({ summary: 'Find appointment by id' })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async findOneById(
    @Query() dto: FindAppointmentByIdDto,
  ): Promise<AppointmentResponseDto> {
    return await this.appointmentsService.findOneById(dto.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Edit appointment by id' })
  @ApiBody({ type: EditAppointmentDto })
  @ApiResponse({ status: 200, type: AppointmentResponseDto })
  async edit(@Body() dto: EditAppointmentDto): Promise<AppointmentResponseDto> {
    return this.appointmentsService.edit(dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete appointment by id' })
  @ApiBody({ type: DeleteAppointmentDto })
  @ApiResponse({ status: 200, schema: { example: { success: true } } })
  async delete(
    @Body() dto: DeleteAppointmentDto,
  ): Promise<{ success: boolean }> {
    return this.appointmentsService.delete(dto.id);
  }
}
