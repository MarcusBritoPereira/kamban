import { UsersService } from './users.service';
import { Role } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        created_at: Date;
        last_active_at: Date;
        avatar_url: string | null;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: import(".prisma/client").$Enums.Role;
        created_at: Date;
        updated_at: Date;
        last_active_at: Date;
        avatar_url: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateData: {
        role?: Role;
        name?: string;
        email?: string;
    }): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: import(".prisma/client").$Enums.Role;
        created_at: Date;
        updated_at: Date;
        last_active_at: Date;
        avatar_url: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    uploadAvatar(id: string, file: any): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: import(".prisma/client").$Enums.Role;
        created_at: Date;
        updated_at: Date;
        last_active_at: Date;
        avatar_url: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: import(".prisma/client").$Enums.Role;
        created_at: Date;
        updated_at: Date;
        last_active_at: Date;
        avatar_url: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
