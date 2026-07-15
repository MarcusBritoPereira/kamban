import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MOCK_PROVIDERS } from '../test-utils/mock-providers';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, ...MOCK_PROVIDERS],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('requires list_id when listing tasks', async () => {
    const filteredService = new TasksService({} as any, {} as any, {} as any);

    await expect(filteredService.findAll()).rejects.toThrow(
      BadRequestException,
    );
  });

  it('applies advanced task filters with safe pagination', async () => {
    const prisma = {
      task: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const filteredService = new TasksService(
      prisma as any,
      {} as any,
      {} as any,
    );

    await filteredService.findAll('list-a', 1, 250, {
      status: 'doing',
      priority: 'high',
      assigneeId: 'user-a',
      tagId: 'tag-a',
      search: 'launch',
      dueAfter: '2026-07-01',
      dueBefore: '2026-07-31',
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          list_id: 'list-a',
          status: 'doing',
          priority: 'high',
          assignees: { some: { user_id: 'user-a' } },
          tags: { some: { tag_id: 'tag-a' } },
          OR: [
            { title: { contains: 'launch', mode: 'insensitive' } },
            { description: { contains: 'launch', mode: 'insensitive' } },
          ],
          deadline: {
            gte: new Date('2026-07-01'),
            lte: new Date('2026-07-31'),
          },
        }),
        take: 100,
      }),
    );
  });
});
