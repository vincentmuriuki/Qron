import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { ScheduleController } from './scheduler/scheduler.controller';
import { ScheduleProcessor } from './scheduler/schedule.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import Redis from 'ioredis';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './auth/auth.controller';
import { PrismaService } from './prisma.service';
import { ApiKeySyncService } from './api-key.sync.service';

@Global()
@Module({
  providers: [{
    provide: 'REDIS_CLIENT',
    useFactory: () => new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT!) ?? 6379
    })
  }],
  exports: ['REDIS_CLIENT']
})
export class RedisModule { }

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    RedisModule,
    HttpModule,
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
  ],
  controllers: [ScheduleController, AuthController],
  providers: [ScheduleProcessor, PrismaService, ApiKeySyncService],
})
export class AppModule { }
