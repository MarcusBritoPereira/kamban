import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async create(createListDto: CreateListDto) {
    const { folder_id, ...data } = createListDto;

    // Validate folder
    const folder = await this.prisma.folder.findUnique({
      where: { id: folder_id },
    });
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folder_id} not found`);
    }

    return this.prisma.list.create({
      data: {
        ...data,
        folder: { connect: { id: folder_id } },
      },
    });
  }

  findAll(folderId?: string) {
    if (folderId) {
      return this.prisma.list.findMany({ where: { folder_id: folderId } });
    }
    return this.prisma.list.findMany();
  }

  findOne(id: string) {
    return this.prisma.list.findUnique({ where: { id } });
  }

  update(id: string, updateListDto: UpdateListDto) {
    return this.prisma.list.update({
      where: { id },
      data: updateListDto,
    });
  }

  remove(id: string) {
    return this.prisma.list.delete({ where: { id } });
  }
}
