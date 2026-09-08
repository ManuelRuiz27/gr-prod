import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminGraduatesService } from './admin-graduates.service';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AccountRole } from '@prisma/client';
import {
  ReducePlacesDto,
  CreateInternalNoteDto,
  CancelMembershipDto,
  RecordManualPaymentDto,
  AdminUpdateMealSelectionDto,
  UpdateThermoStatusDto,
} from './dto/admin-graduates.dto';

@Controller('admin/events/:eventId')
@UseGuards(RolesGuard)
@Roles(AccountRole.ADMIN)
export class AdminGraduatesController {
  constructor(private readonly graduatesService: AdminGraduatesService) {}

  @Get('graduates')
  async listGraduates(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.graduatesService.listGraduates(eventId);
  }

  @Get('graduates/:membershipId')
  async getGraduate(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    return this.graduatesService.getGraduate(eventId, membershipId);
  }

  @Get('graduates/:membershipId/contract')
  async getGraduateContract(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    return this.graduatesService.getGraduateContract(eventId, membershipId);
  }

  @Post('graduates/:membershipId/places')
  async reducePlaces(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Body() dto: ReducePlacesDto,
  ) {
    return this.graduatesService.reducePlaces(eventId, membershipId, dto, actorId);
  }

  @Get('graduates/:membershipId/notes')
  async listInternalNotes(
    @Param('eventId', ParseUUIDPipe) _eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    return this.graduatesService.listInternalNotes(membershipId);
  }

  @Post('graduates/:membershipId/notes')
  async createInternalNote(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Body() dto: CreateInternalNoteDto,
  ) {
    return this.graduatesService.createInternalNote(eventId, membershipId, dto, actorId);
  }

  @Get('graduates/:membershipId/cancellation-quote')
  async getCancellationQuote(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    return this.graduatesService.getCancellationQuote(eventId, membershipId);
  }

  @Post('graduates/:membershipId/cancel')
  async cancelGraduateMembership(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Body() dto: CancelMembershipDto,
  ) {
    return this.graduatesService.cancelGraduateMembership(eventId, membershipId, dto, actorId);
  }

  @Get('graduates/:membershipId/payment-plan')
  async getGraduatePaymentPlan(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    return this.graduatesService.getGraduatePaymentPlan(eventId, membershipId);
  }

  @Post('graduates/:membershipId/payments/manual')
  async recordManualPayment(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Body() dto: RecordManualPaymentDto,
  ) {
    return this.graduatesService.recordManualPayment(eventId, membershipId, dto, actorId);
  }

  @Get('graduates/:membershipId/meals')
  async getGraduateMeals(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    return this.graduatesService.getGraduateMeals(eventId, membershipId);
  }

  @Put('group-members/:memberId/meal-selection')
  async updateMemberMealSelection(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: AdminUpdateMealSelectionDto,
  ) {
    return this.graduatesService.updateMemberMealSelection(eventId, memberId, dto, actorId);
  }

  @Get('graduates/:membershipId/thermo')
  async getGraduateThermo(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    return this.graduatesService.getGraduateThermo(eventId, membershipId);
  }

  @Patch('graduates/:membershipId/thermo')
  async updateGraduateThermoStatus(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Body() dto: UpdateThermoStatusDto,
  ) {
    return this.graduatesService.updateGraduateThermoStatus(eventId, membershipId, dto, actorId);
  }
}
