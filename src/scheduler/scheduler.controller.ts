import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import type { Queue } from "bull";
import { CreateScheduleDto } from "./create-schedule.dto";

@Controller('schedule')
export class ScheduleController {
    constructor(@InjectQueue('webhook-queue') private webhookQueue: Queue) { }

    /**
     * 
     * @param body 
     * @returns {Object} Confirmation of scheduled webhook job
     */
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
    /**
     * 
     * @param id 
     * @returns {Object} Job status and details
     */
    @Get(':id')
    async getJobStatus(@Param('id') id: string) {
        const job = await this.webhookQueue.getJob(id);

        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }

        const state = await job.getState();

        return {
            id: job.id,
            state,
            progress: job.progress(),
            attemptsMade: job.attemptsMade,
            createdAt: new Date(job.timestamp).toISOString(),
            finishedAt: job.finishedOn ? new Date(job.finishedOn).toString() : null,
            processedAt: job.processedOn ? new Date(job.processedOn).toString() : null,

            data: job.data,
            result: job.returnvalue || null,
            error: job.failedReason || null
        }
    }
}