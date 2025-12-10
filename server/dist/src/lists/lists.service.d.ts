import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ListsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createListDto: CreateListDto): Promise<{
        id: string;
        name: string;
        folder_id: string;
    }>;
    findAll(folderId?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        folder_id: string;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ListClient<{
        id: string;
        name: string;
        folder_id: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateListDto: UpdateListDto): import(".prisma/client").Prisma.Prisma__ListClient<{
        id: string;
        name: string;
        folder_id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ListClient<{
        id: string;
        name: string;
        folder_id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
