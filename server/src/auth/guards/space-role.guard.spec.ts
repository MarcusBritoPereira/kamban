import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SpaceRoleGuard } from './space-role.guard';

describe('SpaceRoleGuard tenant isolation', () => {
  const buildContext = (request: any) =>
    ({
      getHandler: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    }) as any;

  const buildGuard = (prismaOverrides: any = {}) => {
    const reflector = {
      get: jest.fn().mockReturnValue('VIEWER'),
    } as unknown as Reflector;
    const prisma = {
      list: { findUnique: jest.fn() },
      folder: { findUnique: jest.fn() },
      task: { findUnique: jest.fn() },
      attachment: { findUnique: jest.fn() },
      space: { findUnique: jest.fn() },
      spaceMember: { findUnique: jest.fn() },
      ...prismaOverrides,
    };

    return { guard: new SpaceRoleGuard(reflector, prisma as any), prisma };
  };

  it('blocks requests when the space scope cannot be resolved', async () => {
    const { guard } = buildGuard();

    await expect(
      guard.canActivate(
        buildContext({
          path: '/v1/tasks',
          params: {},
          query: {},
          body: {},
          user: { id: 'user-a', role: 'editor' },
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('blocks authenticated users that are not members of the resolved space', async () => {
    const { guard, prisma } = buildGuard({
      list: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ folder: { space_id: 'space-a' } }),
      },
      space: {
        findUnique: jest.fn().mockResolvedValue({ owner_id: 'owner-a' }),
      },
      spaceMember: { findUnique: jest.fn().mockResolvedValue(null) },
    });

    await expect(
      guard.canActivate(
        buildContext({
          path: '/v1/tasks',
          params: {},
          query: { list_id: 'list-a' },
          body: {},
          user: { id: 'user-b', role: 'editor' },
        }),
      ),
    ).rejects.toThrow('You do not have access to this space');
    expect(prisma.spaceMember.findUnique).toHaveBeenCalledWith({
      where: { space_id_user_id: { user_id: 'user-b', space_id: 'space-a' } },
    });
  });

  it('allows the owner of the resolved space without implicit membership fallback', async () => {
    const { guard } = buildGuard({
      task: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ list: { folder: { space_id: 'space-a' } } }),
      },
      space: {
        findUnique: jest.fn().mockResolvedValue({ owner_id: 'owner-a' }),
      },
    });

    await expect(
      guard.canActivate(
        buildContext({
          path: '/v1/tasks/task-a',
          params: { id: 'task-a' },
          query: {},
          body: {},
          user: { id: 'owner-a', role: 'editor' },
        }),
      ),
    ).resolves.toBe(true);
  });
});
