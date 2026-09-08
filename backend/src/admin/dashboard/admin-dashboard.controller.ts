import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AccountRole } from '@prisma/client';

@Controller('admin/dashboard')
@UseGuards(RolesGuard)
@Roles(AccountRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get()
  async getDashboardSummary() {
    return this.dashboardService.getDashboardSummary();
  }
}
