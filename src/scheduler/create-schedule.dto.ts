import { IsEnum, IsInt, IsObject, IsOptional, IsUrl, Min } from "class-validator";

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH'
}
export class CreateScheduleDto {
    @IsUrl({}, { message: 'Target must be a valid URL' })
    targetUrl: string;

    @IsInt()
    @Min(1000, { message: 'Delay must be at least 1000 milliseconds (1 second)' })
    delay: number;

    @IsOptional()
    @IsObject()
    payload?: any;

    @IsEnum(HttpMethod)
    @IsOptional()
    method?: HttpMethod
}