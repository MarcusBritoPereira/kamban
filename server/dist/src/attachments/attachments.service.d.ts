import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AttachmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(taskId: string, createAttachmentDto: CreateAttachmentDto): Promise<{
        id: string;
        task_id: string;
        file_url: string;
        file_name: string;
        file_type: string;
        uploaded_by: string | null;
    }>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__AttachmentClient<{
        id: string;
        task_id: string;
        file_url: string;
        file_name: string;
        file_type: string;
        uploaded_by: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
