import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { PermissionsService } from '../permissions/permissions.service';
export declare class SpacesController {
    private readonly spacesService;
    private readonly permissionsService;
    constructor(spacesService: SpacesService, permissionsService: PermissionsService);
    create(createSpaceDto: CreateSpaceDto, req: any): import(".prisma/client").Prisma.Prisma__SpaceClient<{
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(req: any): Promise<({
        owner: {
            name: string;
            email: string;
        };
        tags: {
            id: string;
            name: string;
            space_id: string | null;
            color: string;
        }[];
        members: ({
            user: {
                name: string;
                email: string;
            };
        } & {
            id: string;
            role: string;
            user_id: string;
            space_id: string;
            joined_at: Date;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    } | null>;
    invite(id: string, email: string, req: any): Promise<{
        id: string;
        role: string;
        user_id: string;
        space_id: string;
        joined_at: Date;
    }>;
    update(id: string, updateSpaceDto: UpdateSpaceDto, req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    }>;
}
