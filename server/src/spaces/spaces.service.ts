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

  async findMembers(spaceId: string) {
    // Get members
    const members = await this.prisma.spaceMember.findMany({
      where: { space_id: spaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });

    // Get owner
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });

    if (space && space.owner) {
      // Check if owner is already in members (unlikely but safe to check)
      const ownerInMembers = members.find((m) => m.user.id === space.owner.id);
      if (!ownerInMembers) {
        // Mock a member object for the owner
        const ownerAsMember = {
          id: 'owner-' + space.owner.id, // dummy id
          space_id: spaceId,
          user_id: space.owner.id,
          role: 'owner',
          joined_at: new Date(),
          user: space.owner,
        };
        return [ownerAsMember, ...members];
      }
    }

    return members;
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

  findStatuses(spaceId: string) {
    return this.prisma.customStatus.findMany({
      where: { space_id: spaceId },
      orderBy: [{ position: 'asc' }, { created_at: 'asc' }],
    });
  }

  createStatus(
    spaceId: string,
    data: {
      name: string;
      color?: string;
      position?: number;
      is_default?: boolean;
    },
  ) {
    return this.prisma.customStatus.create({
      data: {
        space_id: spaceId,
        name: data.name,
        color: data.color,
        position: data.position ?? 0,
        is_default: data.is_default ?? false,
      },
    });
  }

  updateStatus(
    spaceId: string,
    statusId: string,
    data: {
      name?: string;
      color?: string;
      position?: number;
      is_default?: boolean;
    },
  ) {
    return this.prisma.customStatus.updateMany({
      where: { id: statusId, space_id: spaceId },
      data,
    });
  }

  removeStatus(spaceId: string, statusId: string) {
    return this.prisma.customStatus.deleteMany({
      where: { id: statusId, space_id: spaceId },
    });
  }

  findCustomFields(spaceId: string) {
    return this.prisma.customFieldDefinition.findMany({
      where: { space_id: spaceId },
      orderBy: [{ position: 'asc' }, { created_at: 'asc' }],
    });
  }

  createCustomField(
    spaceId: string,
    data: {
      name: string;
      type: string;
      options?: unknown;
      required?: boolean;
      position?: number;
    },
  ) {
    return this.prisma.customFieldDefinition.create({
      data: {
        space_id: spaceId,
        name: data.name,
        type: data.type,
        options: data.options as any,
        required: data.required ?? false,
        position: data.position ?? 0,
      },
    });
  }

  updateCustomField(
    spaceId: string,
    fieldId: string,
    data: {
      name?: string;
      type?: string;
      options?: unknown;
      required?: boolean;
      position?: number;
    },
  ) {
    return this.prisma.customFieldDefinition.updateMany({
      where: { id: fieldId, space_id: spaceId },
      data: { ...data, options: data.options as any },
    });
  }

  removeCustomField(spaceId: string, fieldId: string) {
    return this.prisma.customFieldDefinition.deleteMany({
      where: { id: fieldId, space_id: spaceId },
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
