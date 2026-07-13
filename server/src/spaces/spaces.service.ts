import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
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

  async inviteMember(
    spaceId: string,
    email: string,
    invitedById: string,
    role = 'editor',
  ) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException('Email is required');
    }

    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
    });
    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      const existingMember = await this.prisma.spaceMember.findUnique({
        where: {
          space_id_user_id: { space_id: spaceId, user_id: existingUser.id },
        },
      });
      if (existingMember || space.owner_id === existingUser.id) {
        return {
          status: 'accepted',
          member: existingMember,
          message: 'Usuário já faz parte deste espaço.',
        };
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.spaceInvitation.create({
      data: {
        space_id: spaceId,
        email: normalizedEmail,
        role,
        token: randomBytes(32).toString('hex'),
        invited_by_id: invitedById,
        expires_at: expiresAt,
      },
      include: {
        space: { select: { id: true, name: true } },
        invited_by: { select: { id: true, name: true, email: true } },
      },
    });

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') ?? '';
    return {
      ...invitation,
      invite_url: frontendUrl
        ? `${frontendUrl}/spaces/invitations/${invitation.token}`
        : `/spaces/invitations/${invitation.token}`,
    };
  }

  findInvitationsForUser(email: string) {
    return this.prisma.spaceInvitation.findMany({
      where: {
        email: email.trim().toLowerCase(),
        status: 'pending',
        expires_at: { gt: new Date() },
      },
      include: {
        space: { select: { id: true, name: true, description: true } },
        invited_by: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async acceptInvitation(token: string, userId: string, userEmail: string) {
    const invitation = await this.prisma.spaceInvitation.findUnique({
      where: { token },
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation is no longer pending');
    }
    if (invitation.expires_at < new Date()) {
      await this.prisma.spaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invitation has expired');
    }
    if (invitation.email !== userEmail.trim().toLowerCase()) {
      throw new BadRequestException(
        'This invitation was sent to another email',
      );
    }

    const member = await this.prisma.$transaction(async (tx) => {
      const createdMember = await tx.spaceMember.upsert({
        where: {
          space_id_user_id: { space_id: invitation.space_id, user_id: userId },
        },
        update: { role: invitation.role },
        create: {
          space_id: invitation.space_id,
          user_id: userId,
          role: invitation.role,
        },
      });
      await tx.spaceInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          accepted_by_id: userId,
          accepted_at: new Date(),
        },
      });
      return createdMember;
    });

    return { status: 'accepted', member };
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
