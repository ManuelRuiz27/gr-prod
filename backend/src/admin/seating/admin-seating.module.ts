import { Module } from '@nestjs/common';
import { AdminSeatingController } from './admin-seating.controller';
import { AdminSeatingService } from './admin-seating.service';

@Module({
  controllers: [AdminSeatingController],
  providers: [AdminSeatingService],
  exports: [AdminSeatingService],
})
export class AdminSeatingModule {}
