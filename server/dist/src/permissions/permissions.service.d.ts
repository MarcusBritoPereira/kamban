import { PrismaService } from '../prisma/prisma.service';
export declare enum SpaceRole {
    OWNER = "owner",
    ADMIN = "admin",
    EDITOR = "editor",
    VIEWER = "viewer"
}
export declare class PermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    private roleHierarchy;
    getSpaceRole(userId: string, spaceId: string): Promise<SpaceRole | null>;
    hasAccess(userId: string, spaceId: string, requiredRole: SpaceRole): Promise<boolean>;
}
