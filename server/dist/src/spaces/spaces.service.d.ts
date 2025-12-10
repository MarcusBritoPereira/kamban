import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class SpacesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSpaceDto: CreateSpaceDto, ownerId: string): import(".prisma/client").Prisma.Prisma__SpaceClient<{
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(userId: string, userRole: string): Promise<({
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
            space_id: string;
            role: string;
            user_id: string;
            joined_at: Date;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    })[]>;
    addMember(spaceId: string, email: string): Promise<{
        id: string;
        space_id: string;
        role: string;
        user_id: string;
        joined_at: Date;
    }>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__SpaceClient<{
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateSpaceDto: UpdateSpaceDto): import(".prisma/client").Prisma.Prisma__SpaceClient<{
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__SpaceClient<{
        id: string;
        name: string;
        description: string | null;
        owner_id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
