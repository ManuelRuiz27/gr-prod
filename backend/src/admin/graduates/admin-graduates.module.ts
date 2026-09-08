import { Module } from '@nestjs/common';
import { AdminGraduatesController } from './admin-graduates.controller';
import { AdminGraduatesService } from './admin-graduates.service';

@Module({
  controllers: [AdminGraduatesController],
  providers: [AdminGraduatesService],
  exports: [AdminGraduatesService],
})
export class AdminGraduatesModule {}
