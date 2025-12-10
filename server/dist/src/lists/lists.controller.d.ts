import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
export declare class ListsController {
    private readonly listsService;
    constructor(listsService: ListsService);
    create(folderId: string, createListDto: CreateListDto): Promise<{
        id: string;
        folder_id: string;
        name: string;
    }>;
    findAllByFolder(folderId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        folder_id: string;
        name: string;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ListClient<{
        id: string;
        folder_id: string;
        name: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateListDto: UpdateListDto): import(".prisma/client").Prisma.Prisma__ListClient<{
        id: string;
        folder_id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ListClient<{
        id: string;
        folder_id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
