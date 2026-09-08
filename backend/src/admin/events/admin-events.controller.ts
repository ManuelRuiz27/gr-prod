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
import { AdminEventsService } from './admin-events.service';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AccountRole } from '@prisma/client';
import {
  CreateEventWizardDto,
  UpdateEventDto,
  TransitionEventDto,
  RotateAccessCodeDto,
  CreateProductDto,
  UpdateProductDto,
  CreateFinancialConfigurationDto,
  CreateFinancialMilestoneDto,
  UpdateLatePaymentPolicyDto,
  CreateMealOptionDto,
  UpdateMealOptionDto,
  CreateCancellationPolicyDto,
  AddCancellationPolicyRangeDto,
  CreateThermoConfigurationDto,
} from './dto/admin-events.dto';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(AccountRole.ADMIN)
export class AdminEventsController {
  constructor(private readonly eventsService: AdminEventsService) {}

  // 1. Events CRUD & Lifecycle
  @Get('events')
  async listEvents() {
    return this.eventsService.listEvents();
  }

  @Post('events')
  async createEvent(
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateEventWizardDto,
  ) {
    return this.eventsService.createEvent(dto, actorId);
  }

  @Get('events/:eventId')
  async getEvent(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.getEvent(eventId);
  }

  @Patch('events/:eventId')
  async updateEvent(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(eventId, dto, actorId);
  }

  @Delete('events/:eventId')
  async deleteEvent(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.eventsService.deleteEvent(eventId, actorId);
  }

  @Get('events/:eventId/summary')
  async getEventSummary(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.getEventSummary(eventId);
  }

  @Post('events/:eventId/transitions')
  async transitionEvent(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: TransitionEventDto,
  ) {
    return this.eventsService.transitionEvent(eventId, dto, actorId);
  }

  // 2. Access Code
  @Get('events/:eventId/access-code')
  async getAccessCode(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.getAccessCode(eventId);
  }

  @Post('events/:eventId/access-code/rotate')
  async rotateAccessCode(
    @CurrentUser('id') actorId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: RotateAccessCodeDto,
  ) {
    return this.eventsService.rotateAccessCode(eventId, dto, actorId);
  }

  // 3. Products
  @Get('events/:eventId/products')
  async listProducts(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.listProducts(eventId);
  }

  @Post('events/:eventId/products')
  async createProduct(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.eventsService.createProduct(eventId, dto);
  }

  @Patch('events/:eventId/products/:productId')
  async updateProduct(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.eventsService.updateProduct(eventId, productId, dto);
  }

  @Delete('events/:eventId/products/:productId')
  async deleteProduct(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.eventsService.deleteProduct(eventId, productId);
  }

  // 4. Financial Configurations & Milestones
  @Get('events/:eventId/financial-configurations')
  async listFinancialConfigurations(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.listFinancialConfigurations(eventId);
  }

  @Post('events/:eventId/financial-configurations')
  async createFinancialConfigurationDraft(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateFinancialConfigurationDto,
  ) {
    return this.eventsService.createFinancialConfigurationDraft(eventId, dto);
  }

  @Patch('financial-configurations/:configurationId')
  async updateFinancialConfigurationDraft(
    @Param('configurationId', ParseUUIDPipe) configurationId: string,
    @Body() dto: Partial<CreateFinancialConfigurationDto>,
  ) {
    return this.eventsService.updateFinancialConfigurationDraft(configurationId, dto);
  }

  @Post('financial-configurations/:configurationId/publish')
  async publishFinancialConfiguration(
    @Param('configurationId', ParseUUIDPipe) configurationId: string,
  ) {
    return this.eventsService.publishFinancialConfiguration(configurationId);
  }

  @Get('events/:eventId/financial-milestones')
  async listFinancialMilestones(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.listFinancialMilestones(eventId);
  }

  @Post('events/:eventId/financial-milestones')
  async createFinancialMilestone(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateFinancialMilestoneDto,
  ) {
    return this.eventsService.createFinancialMilestone(eventId, dto);
  }

  // 5. Late Payment Policy
  @Get('events/:eventId/late-payment-policy')
  async getLatePaymentPolicy(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.getLatePaymentPolicy(eventId);
  }

  @Put('events/:eventId/late-payment-policy')
  async updateLatePaymentPolicy(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: UpdateLatePaymentPolicyDto,
  ) {
    return this.eventsService.updateLatePaymentPolicy(eventId, dto);
  }

  // 6. Meal Options
  @Get('events/:eventId/meal-options')
  async listMealOptions(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.listMealOptions(eventId);
  }

  @Post('events/:eventId/meal-options')
  async createMealOption(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateMealOptionDto,
  ) {
    return this.eventsService.createMealOption(eventId, dto);
  }

  @Patch('events/:eventId/meal-options/:mealOptionId')
  async updateMealOption(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('mealOptionId', ParseUUIDPipe) mealOptionId: string,
    @Body() dto: UpdateMealOptionDto,
  ) {
    return this.eventsService.updateMealOption(eventId, mealOptionId, dto);
  }

  @Delete('events/:eventId/meal-options/:mealOptionId')
  async deleteMealOption(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('mealOptionId', ParseUUIDPipe) mealOptionId: string,
  ) {
    return this.eventsService.deleteMealOption(eventId, mealOptionId);
  }

  // 7. Cancellation Policies
  @Get('events/:eventId/cancellation-policies')
  async listCancellationPolicies(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.listCancellationPolicies(eventId);
  }

  @Post('events/:eventId/cancellation-policies')
  async createCancellationPolicyDraft(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateCancellationPolicyDto,
  ) {
    return this.eventsService.createCancellationPolicyDraft(eventId, dto);
  }

  @Post('cancellation-policies/:policyId/ranges')
  async addCancellationPolicyRange(
    @Param('policyId', ParseUUIDPipe) policyId: string,
    @Body() dto: AddCancellationPolicyRangeDto,
  ) {
    return this.eventsService.addCancellationPolicyRange(policyId, dto);
  }

  @Post('cancellation-policies/:policyId/validate')
  async validateCancellationPolicyDraft(@Param('policyId', ParseUUIDPipe) policyId: string) {
    return this.eventsService.validateCancellationPolicyDraft(policyId);
  }

  @Post('cancellation-policies/:policyId/publish')
  async publishCancellationPolicy(@Param('policyId', ParseUUIDPipe) policyId: string) {
    return this.eventsService.publishCancellationPolicy(policyId);
  }

  // 8. Thermo Configurations
  @Get('events/:eventId/thermo-configurations')
  async listThermoConfigurations(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventsService.listThermoConfigurations(eventId);
  }

  @Post('events/:eventId/thermo-configurations')
  async createThermoConfigurationDraft(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateThermoConfigurationDto,
  ) {
    return this.eventsService.createThermoConfigurationDraft(eventId, dto);
  }

  @Patch('thermo-configurations/:configurationId')
  async updateThermoConfigurationDraft(
    @Param('configurationId', ParseUUIDPipe) configurationId: string,
    @Body() dto: Partial<CreateThermoConfigurationDto>,
  ) {
    return this.eventsService.updateThermoConfigurationDraft(configurationId, dto);
  }

  @Post('thermo-configurations/:configurationId/publish')
  async publishThermoConfiguration(@Param('configurationId', ParseUUIDPipe) configurationId: string) {
    return this.eventsService.publishThermoConfiguration(configurationId);
  }
}
