import { Injectable } from '@nestjs/common';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpacesService {
  constructor(private prisma: PrismaService) {}

  create(createSpaceDto: CreateSpaceDto, ownerId: string) {
    return this.prisma.space.create({
      data: {
        ...createSpaceDto,
        owner_id: ownerId,
      },
    });
  }

  async findAll(userId: string, userRole: string) {
    if (userRole === 'admin') {
      return this.prisma.space.findMany({
        include: {
          tags: true,
          owner: {
            select: { name: true, email: true },
          },
          members: {
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
      });
    }

    return this.prisma.space.findMany({
      where: {
        OR: [
          { owner_id: userId },
          {
            members: {
              some: {
                user_id: userId,
              },
            },
          },
        ],
      },
      include: {
        tags: true,
        owner: {
          select: { name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });
  }

  async addMember(spaceId: string, email: string) {
    // Find user by email
    const userToAdd = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      throw new Error('User not found');
    }

    return this.prisma.spaceMember.create({
      data: {
        space_id: spaceId,
        user_id: userToAdd.id,
        role: 'editor', // default role
      },
    });
  }

  findOne(id: string) {
    return this.prisma.space.findUnique({ where: { id } });
  }

  update(id: string, updateSpaceDto: UpdateSpaceDto) {
    return this.prisma.space.update({
      where: { id },
      data: updateSpaceDto,
    });
  }

  remove(id: string) {
    return this.prisma.space.delete({ where: { id } });
  }
}
