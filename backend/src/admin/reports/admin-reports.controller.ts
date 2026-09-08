import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AccountRole } from '@prisma/client';
import { CreateExportJobDto } from './dto/admin-reports.dto';

@Controller('admin/events/:eventId')
@UseGuards(RolesGuard)
@Roles(AccountRole.ADMIN)
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @Get('reports/operations')
  async getOperationsReport(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reportsService.getOperationsReport(eventId);
  }

  @Get('reports/financial')
  async getFinancialReport(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reportsService.getFinancialReport(eventId);
  }

  @Get('reports/meals')
  async getMealsReport(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reportsService.getMealsReport(eventId);
  }

  @Get('reports/seating')
  async getSeatingReport(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reportsService.getSeatingReport(eventId);
  }

  @Get('reports/thermos')
  async getThermosReport(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reportsService.getThermosReport(eventId);
  }

  @Get('reports/audit')
  async getAuditReport(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reportsService.getAuditReport(eventId);
  }

  @Get('audit-logs')
  async listAuditLogs(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reportsService.listAuditLogs(eventId);
  }

  @Post('export-jobs')
  async createExportJob(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateExportJobDto,
  ) {
    return this.reportsService.createExportJob(eventId, dto, actorId);
  }

  @Get('export-jobs')
  async listExportJobs(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reportsService.listExportJobs(eventId);
  }

  @Get('export-jobs/:jobId')
  async getExportJob(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.reportsService.getExportJob(eventId, jobId);
  }
}
