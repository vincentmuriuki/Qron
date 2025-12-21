import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, timingSafeEqual } from "crypto";
import Redis from "ioredis";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private configService: ConfigService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const apiKey = request.headers['qron-x-api-key'];

        if (!apiKey) throw new UnauthorizedException('Missing API Key');

        const expectedAdminApiKey: any = this.configService.get<string>('API_KEY');

        // convert to buffers
        const apiKeyBuf = Buffer.from(apiKey)
        const expectedBuf = Buffer.from(expectedAdminApiKey);

        if (apiKeyBuf.length === expectedBuf.length) {
            if (timingSafeEqual(apiKeyBuf, expectedBuf)) {
                return true
            }
        }

        const hashedPiKey = createHash('sha256').update(apiKey).digest('hex');

        const clientName = await this.redis.get(`auth:${hashedPiKey}`);

        if (clientName) {
            request.user = { client: clientName };
            return true
        }

        throw new UnauthorizedException('Invalid API Key')
    }
}