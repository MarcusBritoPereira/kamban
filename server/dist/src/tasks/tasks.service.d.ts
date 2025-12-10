import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AddAssigneeDto } from './dto/add-assignee.dto';
import { AddTagDto } from './dto/add-tag.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTaskDto: CreateTaskDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        list_id: string;
        title: string;
        deadline: Date | null;
        status: string;
        priority: string | null;
    }>;
    findAll(listId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        tags: ({
            tag: {
                id: string;
                name: string;
                space_id: string | null;
                color: string;
            };
        } & {
            task_id: string;
            tag_id: string;
        })[];
        assignees: ({
            user: {
                id: string;
                name: string;
                email: string;
                password_hash: string;
                role: import(".prisma/client").$Enums.Role;
                created_at: Date;
                updated_at: Date;
                last_active_at: Date;
                avatar_url: string | null;
            };
        } & {
            user_id: string;
            task_id: string;
        })[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        list_id: string;
        title: string;
        deadline: Date | null;
        status: string;
        priority: string | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__TaskClient<({
        tags: ({
            tag: {
                id: string;
                name: string;
                space_id: string | null;
                color: string;
            };
        } & {
            task_id: string;
            tag_id: string;
        })[];
        assignees: ({
            user: {
                id: string;
                name: string;
                email: string;
                password_hash: string;
                role: import(".prisma/client").$Enums.Role;
                created_at: Date;
                updated_at: Date;
                last_active_at: Date;
                avatar_url: string | null;
            };
        } & {
            user_id: string;
            task_id: string;
        })[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        list_id: string;
        title: string;
        deadline: Date | null;
        status: string;
        priority: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateTaskDto: UpdateTaskDto): import(".prisma/client").Prisma.Prisma__TaskClient<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        list_id: string;
        title: string;
        deadline: Date | null;
        status: string;
        priority: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__TaskClient<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        list_id: string;
        title: string;
        deadline: Date | null;
        status: string;
        priority: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    addAssignee(taskId: string, addAssigneeDto: AddAssigneeDto): Promise<{
        user_id: string;
        task_id: string;
    }>;
    removeAssignee(taskId: string, userId: string): Promise<{
        user_id: string;
        task_id: string;
    }>;
    addTag(taskId: string, addTagDto: AddTagDto): Promise<{
        task_id: string;
        tag_id: string;
    }>;
    removeTag(taskId: string, tagId: string): Promise<{
        task_id: string;
        tag_id: string;
    }>;
}
