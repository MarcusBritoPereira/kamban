import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(user: { id: string; role: string }, query: string, limit: number = 20) {
    const term = query?.trim();
    if (!term || term.length < 2) {
      return { tasks: [], spaces: [], users: [] };
    }

    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const accessibleSpaceIds = await this.getAccessibleSpaceIds(user);

    if (accessibleSpaceIds.length === 0) {
      return { tasks: [], spaces: [], users: [] };
    }

    const [tasks, spaces, users] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          list: { folder: { space_id: { in: accessibleSpaceIds } } },
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { status: { contains: term, mode: 'insensitive' } },
            { priority: { contains: term, mode: 'insensitive' } },
          ],
        },
        include: {
          assignees: { include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } } },
          tags: { include: { tag: true } },
          list: { include: { folder: { include: { space: true } } } },
        },
        orderBy: { updated_at: 'desc' },
        take: safeLimit,
      }),
      this.prisma.space.findMany({
        where: {
          id: { in: accessibleSpaceIds },
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, description: true, owner_id: true },
        orderBy: { name: 'asc' },
        take: safeLimit,
      }),
      this.prisma.user.findMany({
        where: {
          OR: [
            { spaces: { some: { id: { in: accessibleSpaceIds } } } },
            { member_of: { some: { space_id: { in: accessibleSpaceIds } } } },
          ],
          AND: [
            {
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { email: { contains: term, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: { id: true, name: true, email: true, avatar_url: true, role: true },
        orderBy: { name: 'asc' },
        take: safeLimit,
      }),
    ]);

    return { tasks, spaces, users };
  }

  private async getAccessibleSpaceIds(user: { id: string; role: string }) {
    const spaces = await this.prisma.space.findMany({
      where: user.role === 'admin'
        ? {}
        : {
            OR: [
              { owner_id: user.id },
              { members: { some: { user_id: user.id } } },
            ],
          },
      select: { id: true },
    });

    return spaces.map((space) => space.id);
  }
}
