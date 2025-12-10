import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(taskId: string, createAttachmentDto: CreateAttachmentDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return this.prisma.attachment.create({
      data: {
        ...createAttachmentDto,
        task: { connect: { id: taskId } },
      },
    });
  }

  remove(id: string) {
    return this.prisma.attachment.delete({ where: { id } });
  }
}
