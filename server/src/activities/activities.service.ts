import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ActivitiesService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async logActivity(taskId: string, userId: string, type: 'system' | 'comment', content: string) {
        return this.prisma.taskActivity.create({
            data: {
                task_id: taskId,
                user_id: userId,
                type,
                content,
            },
            include: {
                user: {
                    select: { id: true, name: true, avatar_url: true }
                }
            }
        });
    }

    async findByTask(taskId: string) {
        return this.prisma.taskActivity.findMany({
            where: { task_id: taskId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar_url: true,
                    },
                },
            },
            orderBy: { created_at: 'asc' },
        });
    }

    async createComment(taskId: string, userId: string, content: string) {
        const activity = await this.logActivity(taskId, userId, 'comment', content);

        // Notify task assignees
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { assignees: true }
        });

        if (task && task.assignees) {
            for (const assignee of task.assignees) {
                if (assignee.user_id !== userId) { // Don't notify self
                    await this.notificationsService.create({
                        user_id: assignee.user_id,
                        title: 'Novo Comentário',
                        message: `Novo comentário em "${task.title}"`,
                        type: 'comment',
                        link: `/tasks/${taskId}`
                    });
                }
            }
        }
        return activity;
    }
}
