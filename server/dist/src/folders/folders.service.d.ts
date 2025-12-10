import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class FoldersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createFolderDto: CreateFolderDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        space_id: string;
    }>;
    findAll(spaceId?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        description: string | null;
        space_id: string;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__FolderClient<{
        id: string;
        name: string;
        description: string | null;
        space_id: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateFolderDto: UpdateFolderDto): import(".prisma/client").Prisma.Prisma__FolderClient<{
        id: string;
        name: string;
        description: string | null;
        space_id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__FolderClient<{
        id: string;
        name: string;
        description: string | null;
        space_id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
