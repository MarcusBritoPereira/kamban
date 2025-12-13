import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SpaceRoleGuard implements CanActivate {
    private readonly logger = new Logger(SpaceRoleGuard.name);

    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRole = this.reflector.get<string>('role', context.getHandler());
        // If no specific role is required (or it's just authenticated), pass. 
        // But usually this Guard is used specifically when we want to check space permissions.
        // Let's assume if @Roles('admin') is present, we check for that. 

        // Actually, we want to enforce logic: 
        // - Viewer: Can Read. 
        // - Editor: Can Create/Update/Delete Tasks/Lists. 
        // - Admin: Can Manage Space Settings/Members.

        // We will use metadata key 'spaceRole' to avoid conflict with global 'roles'.
        const minRole = this.reflector.get<string>('spaceRole', context.getHandler());
        if (!minRole) {
            return true; // No space role restriction on this endpoint
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Admins (Global) bypass? Maybe. Let's strictly enforce Space Roles for now.
        // if (user.role === 'ADMIN') return true;

        // Determine Space ID
        let spaceId: string | null = null;

        // Case 1: URL Params (e.g. /spaces/:id)
        if (request.params.id && request.path.includes('/spaces/')) {
            spaceId = request.params.id;
        }
        // Case 2: Space ID in Body (unlikely for REST, usually hierarchy)

        // Case 3: Indirect (List ID provided)
        // POST /tasks { list_id: ... }
        if (!spaceId && request.body && request.body.list_id) {
            const list = await this.prisma.list.findUnique({
                where: { id: request.body.list_id },
                include: { folder: true }
            });
            if (list) spaceId = list.folder.space_id;
        }

        // Case 3.5: Indirect (Folder ID provided)
        // POST /lists { folder_id: ... } or POST /folders/:folderId/lists
        let folderId = request.body ? request.body.folder_id : undefined;
        if (!folderId && request.params.folderId) {
            folderId = request.params.folderId;
        }

        if (!spaceId && folderId) {
            const folder = await this.prisma.folder.findUnique({
                where: { id: folderId }
            });
            if (folder) spaceId = folder.space_id;
        }

        // Case 4: Indirect via Task ID (Update/Delete Task) -> /tasks/:id
        // But we need to distinguish /tasks/:id from /spaces/:id.
        // The Controller context helps, but here we are generic.
        if (!spaceId && request.params.id) {
            // Check if it looks like a task route? 
            // We can't easily know if :id is a task or list or folder without context.
            // However, we can try to fetch based on the resource type implied by the controller/route?
            // Optimally, we fetch the Task and get the spaceId.

            // Let's try to resolve based on common patterns or just accept that this Guard 
            // might need to be "TaskSpaceRoleGuard" vs "ListSpaceRoleGuard" OR be smart.

            // Smart approach: Attempt to find Task first if route contains 'tasks'.
            if (request.path.includes('/tasks')) {
                const task = await this.prisma.task.findUnique({
                    where: { id: request.params.id },
                    include: { list: { include: { folder: true } } }
                });
                if (task) spaceId = task.list.folder.space_id;
            } else if (request.path.includes('/lists')) {
                const list = await this.prisma.list.findUnique({
                    where: { id: request.params.id },
                    include: { folder: true }
                });
                if (list) spaceId = list.folder.space_id;
            }
        }

        if (!spaceId) {
            this.logger.warn(`Could not determine Space ID for path ${request.path}`);
            return true;
        }

        this.logger.log(`Checking membership for User ${user.id} in Space ${spaceId}`);

        // Check Membership
        let membership = await this.prisma.spaceMember.findUnique({
            where: {
                space_id_user_id: {
                    user_id: user.id,
                    space_id: spaceId
                }
            }
        });

        if (!membership) {
            this.logger.warn(`Implicit membership (All Users Rule) granted for User ${user.id} in Space ${spaceId}`);
            // Implicitly grant EDITOR role to all authenticated users as per business rule
            // We cast to any to avoid "partial" type issues if SpaceMember has more fields
            membership = { role: 'EDITOR' } as any;
        }

        // Role Hierarchy: ADMIN > EDITOR > VIEWER
        const roleValue: Record<string, number> = {
            'VIEWER': 1,
            'EDITOR': 2,
            'ADMIN': 3
        };

        const userRoleValue = roleValue[membership!.role] || 0;
        const requiredRoleValue = roleValue[minRole.toUpperCase()] || 99;

        if (userRoleValue < requiredRoleValue) {
            throw new ForbiddenException(`Insufficient permissions. Required: ${minRole}, Actual: ${membership!.role}`);
        }

        return true;
    }
}
