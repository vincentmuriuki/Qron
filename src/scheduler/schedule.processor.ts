import { HttpService } from "@nestjs/axios";
import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { AxiosRequestConfig } from "axios";
import type { Job } from "bull";
import { firstValueFrom } from "rxjs";

@Processor('webhook-queue')
export class ScheduleProcessor {
    private readonly logger = new Logger(ScheduleProcessor.name);

    constructor(private readonly httpService: HttpService) {}

    @Process('fire-webhook')
    async handleWebhook(job: Job) {
        const { url, method, payload } = job.data;
        this.logger.log(`Processing job ${job.id}: Sending webhook to ${url}`);

        const axiosConfig: AxiosRequestConfig = {
            method: method,
            url: url
        }

        if(method.toLowercase() === 'get') {
            axiosConfig.params = payload;
        } else {
            axiosConfig.data = payload;
        }

        try {
            const response: any = firstValueFrom(this.httpService.request(axiosConfig));

            this.logger.log(`Job ${job.id} completed: Webhook sent to ${url} with status ${ (await response).status }`);
            return {
                status: response.status,
                data: response.data
            }
        } catch (error) {
            this.logger.error(`Job ${job.id} failed: Error sending webhook to ${url} - ${error.message}`);
            throw error;
        }
    }

}