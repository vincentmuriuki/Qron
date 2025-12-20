import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Redis } from 'ioredis';
import { Cron } from "@nestjs/schedule";


@Injectable()
export class ApiKeySyncService implements OnModuleInit {
    private readonly logger = new Logger(ApiKeySyncService.name)

    constructor(
        private prisma: PrismaService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing API Key caching')
        await this.syncToRedis()
    }

    @Cron('*/30 * * * * *')
    async handleCron() {
        this.logger.debug('30s interval sync!')
        await this.syncToRedis()
    }

    async syncToRedis() {
        try {
            const activeKeys = await this.prisma.apiKey.findMany({
                where: {
                    isActive: true
                }
            })
            if (activeKeys.length === 0) {
                this.logger.warn('No active API Keys found to sync!')
                return;
            }

            const pipeline = this.redis.pipeline();

            activeKeys.forEach((record) => {
                pipeline.set(`auth:${record.key}`, record.client)
            })

            await pipeline.exec();
            this.logger.log(`Successfully synced ${activeKeys.length} API Keys to Redis`)
        } catch (e) {
            this.logger.error(`Error syncing API Keys to Redis: ${e.message}`)

        }
    }
}