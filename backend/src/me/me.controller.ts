import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MeService } from './me.service';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { Roles } from '../common/guards/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Idempotent } from '../common/idempotency/idempotent.decorator';
import { IdempotencyInterceptor } from '../common/idempotency/idempotency.interceptor';
import { AccountRole } from '@prisma/client';
import {
  UpdateProfileDto,
  CreateGroupMemberDto,
  UpdateGroupMemberDto,
  QuoteLineItemsDto,
  AddLineItemsDto,
  SelectMealDto,
  AssignTableMembersDto,
  CreatePaymentAttemptDto,
  SubmitPaymentProofDto,
  RequestThermoDto,
  MarkNotificationReadDto,
} from './dto/me.dto';
import { Request } from 'express';

@Controller('me')
@UseGuards(RolesGuard)
@Roles(AccountRole.GRADUATE, AccountRole.ADMIN)
export class MeController {
  constructor(private readonly meService: MeService) {}

  // 1. Profile
  @Get('profile')
  async getProfile(@CurrentUser('id') accountId: string) {
    return this.meService.getProfile(accountId);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') accountId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.meService.updateProfile(accountId, dto);
  }

  // 2. Events & Summary
  @Get('events')
  async listEvents(@CurrentUser('id') accountId: string) {
    return this.meService.listEvents(accountId);
  }

  @Get('events/:eventId')
  async getEvent(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getEvent(accountId, eventId);
  }

  @Get('events/:eventId/summary')
  async getEventSummary(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getEventSummary(accountId, eventId);
  }

  // 3. Contract
  @Get('events/:eventId/contract')
  async getContract(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getContract(accountId, eventId);
  }

  @Post('events/:eventId/contract/accept')
  async acceptContract(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];
    return this.meService.acceptContract(accountId, eventId, ip, userAgent);
  }

  // 4. Group Members
  @Get('events/:eventId/group')
  async getGroup(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getGroup(accountId, eventId);
  }

  @Get('events/:eventId/group-members')
  async listGroupMembers(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.listGroupMembers(accountId, eventId);
  }

  @Post('events/:eventId/group-members')
  async createGroupMember(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateGroupMemberDto,
  ) {
    return this.meService.createGroupMember(accountId, eventId, dto);
  }

  @Patch('events/:eventId/group-members/:memberId')
  async updateGroupMember(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateGroupMemberDto,
  ) {
    return this.meService.updateGroupMember(accountId, eventId, memberId, dto);
  }

  @Delete('events/:eventId/group-members/:memberId')
  async deleteGroupMember(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.meService.deleteGroupMember(accountId, eventId, memberId);
  }

  // 5. Products & Quotes
  @Get('events/:eventId/products')
  async listProducts(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.listProducts(accountId, eventId);
  }

  @Post('events/:eventId/contract-line-items/quote')
  async quoteLineItems(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: QuoteLineItemsDto,
  ) {
    return this.meService.quoteLineItems(accountId, eventId, dto);
  }

  @UseInterceptors(IdempotencyInterceptor)
  @Idempotent(true)
  @Post('events/:eventId/contract-line-items')
  async addLineItems(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: AddLineItemsDto,
  ) {
    return this.meService.addLineItems(accountId, eventId, dto);
  }

  // 6. Meals
  @Get('events/:eventId/meals')
  async getMealOptions(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getMealOptions(accountId, eventId);
  }

  @Put('events/:eventId/group-members/:memberId/meal-selection')
  async selectMeal(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: SelectMealDto,
  ) {
    return this.meService.selectMeal(accountId, eventId, memberId, dto);
  }

  // 7. Seating & Table Assignments
  @Get('events/:eventId/seating-map')
  async getSeatingMap(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getSeatingMap(accountId, eventId);
  }

  @Get('events/:eventId/table-assignments')
  async getTableAssignments(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getTableAssignments(accountId, eventId);
  }

  @Put('events/:eventId/table-assignments')
  async assignTableMembers(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: AssignTableMembersDto,
  ) {
    return this.meService.assignTableMembers(accountId, eventId, dto);
  }

  // 8. Payment Plan, Attempts & Submissions
  @Get('events/:eventId/payment-plan')
  async getPaymentPlan(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getPaymentPlan(accountId, eventId);
  }

  @Post('events/:eventId/payment-attempts')
  async createPaymentAttempt(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreatePaymentAttemptDto,
  ) {
    return this.meService.createPaymentAttempt(accountId, eventId, dto);
  }

  @Get('events/:eventId/payment-attempts/:attemptId')
  async getPaymentAttempt(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
  ) {
    return this.meService.getPaymentAttempt(accountId, eventId, attemptId);
  }

  @Post('files/payment-evidence')
  async uploadPaymentEvidence(
    @CurrentUser('id') accountId: string,
    @Body() body: { filename: string; mimeType: string; size: number },
  ) {
    return this.meService.uploadPaymentEvidence(accountId, body);
  }

  @UseInterceptors(IdempotencyInterceptor)
  @Idempotent(true)
  @Post('events/:eventId/payment-submissions')
  async submitPaymentProof(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: SubmitPaymentProofDto,
  ) {
    return this.meService.submitPaymentProof(accountId, eventId, dto);
  }

  @Get('events/:eventId/payment-submissions')
  async listPaymentSubmissions(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.listPaymentSubmissions(accountId, eventId);
  }

  @Get('events/:eventId/payment-submissions/:submissionId')
  async getPaymentSubmission(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ) {
    return this.meService.getPaymentSubmission(accountId, eventId, submissionId);
  }

  // 9. Thermos
  @Get('events/:eventId/thermo')
  async getThermo(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.meService.getThermo(accountId, eventId);
  }

  @Post('events/:eventId/thermo/request')
  async requestThermo(
    @CurrentUser('id') accountId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: RequestThermoDto,
  ) {
    return this.meService.requestThermo(accountId, eventId, dto);
  }

  // 10. Notifications
  @Get('notifications')
  async listNotifications(@CurrentUser('id') accountId: string) {
    return this.meService.listNotifications(accountId);
  }

  @Patch('notifications/:notificationId')
  async markNotificationRead(
    @CurrentUser('id') accountId: string,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
    @Body() dto: MarkNotificationReadDto,
  ) {
    return this.meService.markNotificationRead(accountId, notificationId, dto);
  }
}
