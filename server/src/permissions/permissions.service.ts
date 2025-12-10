import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum SpaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  private roleHierarchy = {
    [SpaceRole.OWNER]: 4,
    [SpaceRole.ADMIN]: 3,
    [SpaceRole.EDITOR]: 2,
    [SpaceRole.VIEWER]: 1,
  };

  /**
   * Determine the user's role in a specific space.
   * Returns 'owner' if they own the space.
   * Returns their member role if they are a member.
   * Returns null if no access.
   */
  async getSpaceRole(
    userId: string,
    spaceId: string,
  ): Promise<SpaceRole | null> {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        members: {
          where: { user_id: userId },
        },
      },
    });

    if (!space) return null;

    if (space.owner_id === userId) {
      return SpaceRole.OWNER;
    }

    if (space.members.length > 0) {
      const roleStr = space.members[0].role;
      // Map string to enum if needed, or cast if valid
      return roleStr as SpaceRole;
    }

    return null;
  }

  /**
   * Check if a user has at least the required role level.
   */
  async hasAccess(
    userId: string,
    spaceId: string,
    requiredRole: SpaceRole,
  ): Promise<boolean> {
    const userRole = await this.getSpaceRole(userId, spaceId);
    if (!userRole) return false;

    const userLevel = this.roleHierarchy[userRole] || 0;
    const requiredLevel = this.roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }
}
