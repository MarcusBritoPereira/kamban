import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
    imports: [PermissionsModule],
    controllers: [TagsController],
    providers: [TagsService, PrismaService],
    exports: [TagsService], // Export if needed by other modules
})
export class TagsModule { }
