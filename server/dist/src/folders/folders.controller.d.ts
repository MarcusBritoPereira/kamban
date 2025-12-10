import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
export declare class FoldersController {
    private readonly foldersService;
    constructor(foldersService: FoldersService);
    create(spaceId: string, createFolderDto: CreateFolderDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        space_id: string;
    }>;
    isAuthenticated(spaceId: string): import(".prisma/client").Prisma.PrismaPromise<{
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
