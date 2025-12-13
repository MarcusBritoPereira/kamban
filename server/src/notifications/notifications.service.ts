import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(data: { user_id: string; title: string; message: string; type: string; link?: string }) {
        return this.prisma.notification.create({
            data: {
                ...data,
                read: false,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 20,
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { user_id: userId, read: false },
            data: { read: true },
        });
    }
}
