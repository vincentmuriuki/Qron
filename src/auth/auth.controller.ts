import { PrismaService } from "src/prisma.service";
import { ConfigService } from "@nestjs/config"
import { ApiKeySyncService } from "src/api-key.sync.service";
import { Body, Controller, Delete, Headers, Inject, NotFoundException, Param, Post, UnauthorizedException } from "@nestjs/common";
import Redis from "ioredis";
import { v4 as uuidv4 } from 'uuid';
import { createHash } from "crypto";
import { ApiKey } from "generated/prisma/client";

@Controller('auth')
export class AuthController {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private syncService: ApiKeySyncService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) { }

    private validateAdmin(key: string) {
        if (key !== this.configService.get('API_KEY')) {
            throw new UnauthorizedException('Admin access only')
        }
    }

    @Post('keys')
    async createKey(
        @Headers('qron-x-api-key') adminKey: string,
        @Body('client') clientName: string
    ) {
        this.validateAdmin(adminKey)

        const newKey = `sk_live_${uuidv4()}`;

        await this.prisma.apiKey.create({
            data: {
                key: createHash('sha256').update(newKey).digest('hex'),
                client: clientName
            }
        });

        await this.redis.set(`auth:${newKey}`, clientName)

        return {
            apiKey: newKey,
            client: clientName
        }
    }

    @Delete('keys/:id')
    async deleteKey(
        @Headers('qron-x-api-key') adminkey: string,
        @Param('key') idToRevoke: string
    ) {
        await this.validateAdmin(adminkey);

        const existingKey: any = await this.prisma.apiKey.findUnique({ where: { id: idToRevoke } });

        if (!existingKey) throw new NotFoundException('Key ID not found')

        await this.prisma.apiKey.update({
            where: { id: idToRevoke },
            data: { isActive: false }
        });

        await this.redis.del(`auth:${existingKey.key}`)

        return {
            message: 'key revoked'
        }
    }

    @Post('sync')
    async forceSync(@Headers('qron-x-api-key') adminKey) {
        await this.validateAdmin(adminKey);

        await this.syncService.syncToRedis();
        return {
            triggered: true
        }
    }
}