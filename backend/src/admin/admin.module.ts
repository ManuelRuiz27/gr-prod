import { Module } from '@nestjs/common';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';
import { AdminEventsModule } from './events/admin-events.module';
import { AdminGraduatesModule } from './graduates/admin-graduates.module';
import { AdminFinanceModule } from './finance/admin-finance.module';
import { AdminSeatingModule } from './seating/admin-seating.module';
import { AdminReportsModule } from './reports/admin-reports.module';

@Module({
  imports: [
    AdminEventsModule,
    AdminGraduatesModule,
    AdminFinanceModule,
    AdminSeatingModule,
    AdminReportsModule,
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
  exports: [
    AdminDashboardService,
    AdminEventsModule,
    AdminGraduatesModule,
    AdminFinanceModule,
    AdminSeatingModule,
    AdminReportsModule,
  ],
})
export class AdminModule {}
