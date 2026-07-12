import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { FoldersService } from '../folders/folders.service';
import { ListsService } from '../lists/lists.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PermissionsService } from '../permissions/permissions.service';
import { SpacesService } from '../spaces/spaces.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { ActivitiesService } from '../activities/activities.service';

const prismaMock = new Proxy(
  {},
  {
    get: () =>
      new Proxy(
        {},
        {
          get: () => jest.fn(),
        },
      ),
  },
);

export const MOCK_PROVIDERS = [
  { provide: PrismaService, useValue: prismaMock },
  { provide: JwtService, useValue: { sign: jest.fn(() => 'test-token') } },
  { provide: ConfigService, useValue: { get: jest.fn(() => undefined) } },
  { provide: AuthService, useValue: {} },
  { provide: AttachmentsService, useValue: {} },
  { provide: FoldersService, useValue: {} },
  { provide: ListsService, useValue: {} },
  { provide: NotificationsService, useValue: {} },
  { provide: PermissionsService, useValue: {} },
  { provide: SpacesService, useValue: {} },
  { provide: TasksService, useValue: {} },
  { provide: UsersService, useValue: {} },
  { provide: ActivitiesService, useValue: {} },
];
