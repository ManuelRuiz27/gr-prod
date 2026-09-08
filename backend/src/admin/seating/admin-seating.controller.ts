import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminSeatingService } from './admin-seating.service';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AccountRole } from '@prisma/client';
import {
  UpdateSeatingMapDto,
  CreateTableDto,
  UpdateTableDto,
  BulkCreateTablesDto,
  ImportDetectedTablesDto,
  AdminAssignTableMembersDto,
} from './dto/admin-seating.dto';

@Controller('admin/events/:eventId')
@UseGuards(RolesGuard)
@Roles(AccountRole.ADMIN)
export class AdminSeatingController {
  constructor(private readonly seatingService: AdminSeatingService) {}

  // 1. Seating Map
  @Get('seating-map')
  async getSeatingMap(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.seatingService.getSeatingMap(eventId);
  }

  @Put('seating-map')
  async updateSeatingMap(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: UpdateSeatingMapDto,
  ) {
    return this.seatingService.updateSeatingMap(eventId, dto);
  }

  @Post('seating-map/background')
  async uploadBackground(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() body: { backgroundUrl: string },
  ) {
    return this.seatingService.uploadBackground(eventId, body.backgroundUrl, actorId);
  }

  @Delete('seating-map/background')
  async deleteBackground(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.seatingService.deleteBackground(eventId, actorId);
  }

  // 2. Tables CRUD
  @Get('tables')
  async listTables(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.seatingService.listTables(eventId);
  }

  @Post('tables')
  async createTable(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateTableDto,
  ) {
    return this.seatingService.createTable(eventId, dto);
  }

  @Post('tables/bulk')
  async bulkCreateTables(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: BulkCreateTablesDto,
  ) {
    return this.seatingService.bulkCreateTables(eventId, dto);
  }

  // Transactional Detected Tables Import
  @Post('tables/import')
  async importDetectedTables(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: ImportDetectedTablesDto,
  ) {
    return this.seatingService.importDetectedTables(eventId, dto, actorId);
  }

  @Get('tables/:tableId')
  async getTable(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tableId', ParseUUIDPipe) tableId: string,
  ) {
    return this.seatingService.getTable(eventId, tableId);
  }

  @Patch('tables/:tableId')
  async updateTable(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tableId', ParseUUIDPipe) tableId: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.seatingService.updateTable(eventId, tableId, dto);
  }

  @Delete('tables/:tableId')
  async deleteTable(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tableId', ParseUUIDPipe) tableId: string,
  ) {
    return this.seatingService.deleteTable(eventId, tableId);
  }

  @Post('tables/:tableId/block')
  async blockTable(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tableId', ParseUUIDPipe) tableId: string,
  ) {
    return this.seatingService.blockTable(eventId, tableId, actorId);
  }

  @Post('tables/:tableId/unblock')
  async unblockTable(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tableId', ParseUUIDPipe) tableId: string,
  ) {
    return this.seatingService.unblockTable(eventId, tableId, actorId);
  }

  @Get('tables/:tableId/assignments')
  async getTableAssignments(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tableId', ParseUUIDPipe) tableId: string,
  ) {
    return this.seatingService.getTableAssignments(eventId, tableId);
  }

  @Get('table-assignments')
  async listEventTableAssignments(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.seatingService.listEventTableAssignments(eventId);
  }

  @Post('tables/:tableId/assignments')
  async adminAssignTableMembers(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('tableId', ParseUUIDPipe) tableId: string,
    @Body() dto: AdminAssignTableMembersDto,
  ) {
    return this.seatingService.adminAssignTableMembers(eventId, tableId, dto, actorId);
  }
}
