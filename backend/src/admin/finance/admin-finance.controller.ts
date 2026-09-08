import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminFinanceService } from './admin-finance.service';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AccountRole } from '@prisma/client';
import {
  ApproveSubmissionDto,
  RejectSubmissionDto,
  CreateAdjustmentDto,
  CreateRefundDto,
  ResolveReconciliationCaseDto,
} from './dto/admin-finance.dto';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(AccountRole.ADMIN)
export class AdminFinanceController {
  constructor(private readonly financeService: AdminFinanceService) {}

  @Get('events/:eventId/portfolio')
  async getPortfolioSummary(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.financeService.getPortfolioSummary(eventId);
  }

  @Get('events/:eventId/payment-transactions')
  async listPaymentTransactions(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.financeService.listPaymentTransactions(eventId);
  }

  @Get('payment-submissions')
  async listPaymentSubmissions(
    @Query('status') status?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.financeService.listPaymentSubmissions(status, eventId);
  }

  @Get('payment-submissions/:submissionId')
  async getPaymentSubmission(@Param('submissionId', ParseUUIDPipe) submissionId: string) {
    return this.financeService.getPaymentSubmission(submissionId);
  }

  @Post('payment-submissions/:submissionId/approve')
  async approvePaymentSubmission(
    @CurrentUser('id') actorId: string,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: ApproveSubmissionDto,
  ) {
    return this.financeService.approvePaymentSubmission(submissionId, dto, actorId);
  }

  @Post('payment-submissions/:submissionId/reject')
  async rejectPaymentSubmission(
    @CurrentUser('id') actorId: string,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: RejectSubmissionDto,
  ) {
    return this.financeService.rejectPaymentSubmission(submissionId, dto, actorId);
  }

  @Post('payment-plans/:planId/adjustments')
  async createPaymentPlanAdjustment(
    @CurrentUser('id') actorId: string,
    @Param('planId', ParseUUIDPipe) planId: string,
    @Body() dto: CreateAdjustmentDto,
  ) {
    return this.financeService.createPaymentPlanAdjustment(planId, dto, actorId);
  }

  @Post('payment-plans/:planId/refunds')
  async createPaymentPlanRefund(
    @CurrentUser('id') actorId: string,
    @Param('planId', ParseUUIDPipe) planId: string,
    @Body() dto: CreateRefundDto,
  ) {
    return this.financeService.createPaymentPlanRefund(planId, dto, actorId);
  }

  @Get('events/:eventId/refunds')
  async listEventRefunds(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.financeService.listEventRefunds(eventId);
  }

  @Get('reconciliation-cases')
  async listReconciliationCases(@Query('eventId') eventId?: string) {
    return this.financeService.listReconciliationCases(eventId);
  }

  @Post('reconciliation-cases/:caseId/resolve')
  async resolveReconciliationCase(
    @CurrentUser('id') actorId: string,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: ResolveReconciliationCaseDto,
  ) {
    return this.financeService.resolveReconciliationCase(caseId, dto, actorId);
  }
}
