import { Module, Global } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
    imports: [NotificationsModule],
    controllers: [ActivitiesController],
    providers: [ActivitiesService, PrismaService],
    exports: [ActivitiesService],
})
export class ActivitiesModule { }
