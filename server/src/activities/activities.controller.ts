import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { SpaceRole } from '../auth/decorators/space-role.decorator';

@UseGuards(JwtAuthGuard)
@Controller('v1/tasks/:taskId')
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) { }

    @Get('activities')
    @UseGuards(SpaceRoleGuard)
    @SpaceRole('VIEWER')
    findAll(@Param('taskId') taskId: string) {
        return this.activitiesService.findByTask(taskId);
    }

    @Post('comments')
    @UseGuards(SpaceRoleGuard)
    @SpaceRole('EDITOR')
    createComment(
        @Param('taskId') taskId: string,
        @Body() data: { content: string },
        @Request() req: any,
    ) {
        return this.activitiesService.createComment(taskId, req.user.id, data.content);
    }
}
