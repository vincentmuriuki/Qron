import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { ScheduleController } from './scheduler/scheduler.controller';
import { ScheduleProcessor } from './scheduler/schedule.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';

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

    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter
    }),

    BullBoardModule.forFeature({
      name: 'webhook-queue',
      adapter: BullAdapter
    }),
    HttpModule
  ],
  controllers: [ScheduleController],
  providers: [ScheduleProcessor],
})
export class AppModule {}
