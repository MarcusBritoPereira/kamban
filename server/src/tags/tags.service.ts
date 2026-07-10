import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async findAll(spaceId: string) {
        return this.prisma.tag.findMany({
            where: { space_id: spaceId },
            orderBy: { name: 'asc' },
        });
    }

    async findById(id: string) {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return tag;
    }

    async create(spaceId: string, data: { name: string; color: string }) {
        return this.prisma.tag.create({
            data: {
                name: data.name,
                color: data.color,
                space: { connect: { id: spaceId } }
            }
        });
    }

    async update(id: string, data: { name?: string; color?: string }) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag) throw new NotFoundException('Tag not found');

        return this.prisma.tag.update({
            where: { id },
            data: {
                name: data.name,
                color: data.color,
            },
            // Note: Updating a tag automatically updates it for all tasks because the relation uses the Tag ID.
        });
    }

    async remove(id: string) {
        // Prisma cascading should handle removing from TaskTags if configured, 
        // effectively removing it from tasks.
        // Let's verify schema: `tasks TaskTag[]` in Tag model. 
        // And TaskTag: `tag Tag @relation(..., onDelete: Cascade)`
        // Yes, Cascade delete is set on TaskTag.tag_id points to Tag.id.

        return this.prisma.tag.delete({
            where: { id },
        });
    }
}
