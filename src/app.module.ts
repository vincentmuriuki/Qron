import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { ScheduleController } from './scheduler/scheduler.controller';
import { ScheduleProcessor } from './scheduler/schedule.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT!) ?? 6379
      }
    }),
    BullModule.registerQueue({
      name: 'webhook-queue'
    }),
    HttpModule
  ],
  controllers: [ScheduleController],
  providers: [ScheduleProcessor],
})
export class AppModule {}
