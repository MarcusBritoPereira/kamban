import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('v1/tasks/:taskId')
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) { }

    @Get('activities')
    findAll(@Param('taskId') taskId: string) {
        return this.activitiesService.findByTask(taskId);
    }

    @Post('comments')
    createComment(
        @Param('taskId') taskId: string,
        @Body() data: { content: string },
        @Request() req: any,
    ) {
        return this.activitiesService.createComment(taskId, req.user.id, data.content);
    }
}
