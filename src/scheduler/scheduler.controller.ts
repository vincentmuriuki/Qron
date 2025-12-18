import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Get, Post } from "@nestjs/common";
import type { Queue } from "bull";
import { CreateScheduleDto } from "./create-schedule.dto";

@Controller('schedule')
export class ScheduleController {
    constructor(@InjectQueue('webhook-queue') private webhookQueue: Queue) { }

    @Post()
    async scheduleWebhook(@Body() body: CreateScheduleDto) {
        const job = await this.webhookQueue.add('fire-webhook',
            {
                url: body.targetUrl,
                payload: body.payload,
                method: body.method || 'POST'
            },
            {
                delay: body.delay,
                attempts: 3,
                backoff: 3000,
                removeOnComplete: true
            }
        )

        return {
            success: true,
            jobId: job.id,
            message: `Webhook scheduled for ${body.targetUrl} in ${body.delay} ms`
        }
    }
}