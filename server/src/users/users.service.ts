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

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
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
