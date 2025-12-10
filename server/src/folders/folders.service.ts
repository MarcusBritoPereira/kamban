import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async create(createFolderDto: CreateFolderDto) {
    const { space_id, ...data } = createFolderDto;

    // Validate space existence
    const space = await this.prisma.space.findUnique({
      where: { id: space_id },
    });
    if (!space) {
      throw new NotFoundException(`Space with ID ${space_id} not found`);
    }

    return this.prisma.folder.create({
      data: {
        ...data,
        space: { connect: { id: space_id } },
      },
    });
  }

  findAll(spaceId?: string) {
    if (spaceId) {
      return this.prisma.folder.findMany({ where: { space_id: spaceId } });
    }
    return this.prisma.folder.findMany();
  }

  findOne(id: string) {
    return this.prisma.folder.findUnique({ where: { id } });
  }

  update(id: string, updateFolderDto: UpdateFolderDto) {
    return this.prisma.folder.update({
      where: { id },
      data: updateFolderDto,
    });
  }

  remove(id: string) {
    return this.prisma.folder.delete({ where: { id } });
  }
}
