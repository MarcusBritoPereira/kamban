import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar_url: true,
        email: true,
        role: true,
        last_active_at: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  getDirectory() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar_url: true,
        email: true // Optional: might be needed for identification
      },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: string, data: { role?: Role; name?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    // Delete spaces owned by user first (to satisfy constraints)
    // The Schema doesn't have Cascade on Owner->Space, but Space->Folder->List->Task DOES cascade.
    // So deleting the Space is enough.
    return this.prisma.$transaction([
      this.prisma.space.deleteMany({
        where: { owner_id: id },
      }),
      this.prisma.user.delete({
        where: { id },
      }),
    ]);
  }

  updateLastActivity(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { last_active_at: new Date() },
    });
  }

  updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatar_url: avatarUrl },
    });
  }
}
