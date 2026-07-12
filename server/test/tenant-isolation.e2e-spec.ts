import {
  Controller,
  Get,
  INestApplication,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { SpaceRole } from '../src/auth/decorators/space-role.decorator';
import { SpaceRoleGuard } from '../src/auth/guards/space-role.guard';
import { PrismaService } from '../src/prisma/prisma.service';

@Controller('tenant-probe')
class TenantProbeController {
  @Get('tasks')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  findTasks(@Query('list_id') listId: string, @Req() req: any) {
    return { listId, userId: req.user.id };
  }
}

describe('Tenant isolation (e2e)', () => {
  let app: INestApplication;
  const prisma = {
    list: { findUnique: jest.fn() },
    folder: { findUnique: jest.fn() },
    task: { findUnique: jest.fn() },
    attachment: { findUnique: jest.fn() },
    space: { findUnique: jest.fn() },
    spaceMember: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TenantProbeController],
      providers: [
        SpaceRoleGuard,
        Reflector,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => {
      req.user = {
        id: req.header('x-user-id') ?? 'user-a',
        role: req.header('x-user-role') ?? 'editor',
      };
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects cross-tenant list access when requester is not a space member', async () => {
    prisma.list.findUnique.mockResolvedValue({
      folder: { space_id: 'space-a' },
    });
    prisma.space.findUnique.mockResolvedValue({ owner_id: 'owner-a' });
    prisma.spaceMember.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/tenant-probe/tasks')
      .query({ list_id: 'list-a' })
      .set('x-user-id', 'user-b')
      .expect(403);
  });

  it('allows access when requester is a member of the resolved space', async () => {
    prisma.list.findUnique.mockResolvedValue({
      folder: { space_id: 'space-a' },
    });
    prisma.space.findUnique.mockResolvedValue({ owner_id: 'owner-a' });
    prisma.spaceMember.findUnique.mockResolvedValue({ role: 'viewer' });

    await request(app.getHttpServer())
      .get('/tenant-probe/tasks')
      .query({ list_id: 'list-a' })
      .set('x-user-id', 'user-a')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ listId: 'list-a', userId: 'user-a' });
      });
  });
});
