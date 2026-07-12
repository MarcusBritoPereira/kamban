import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpacesModule } from './spaces/spaces.module';
import { FoldersModule } from './folders/folders.module';
import { ListsModule } from './lists/lists.module';
import { TasksModule } from './tasks/tasks.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UsersModule } from './users/users.module';
import { TagsModule } from './tags/tags.module';
import { ActivitiesModule } from './activities/activities.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LastActivityInterceptor } from './auth/last-activity.interceptor';
import { NotificationsModule } from './notifications/notifications.module';
import { CompaniesModule } from './companies/companies.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    SpacesModule,
    FoldersModule,
    ListsModule,
    TasksModule,
    AttachmentsModule,
    PermissionsModule,
    UsersModule,
    NotificationsModule,
    TagsModule,
    ActivitiesModule,
    CompaniesModule,
    DashboardModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LastActivityInterceptor,
    },
  ],
})
export class AppModule {}
