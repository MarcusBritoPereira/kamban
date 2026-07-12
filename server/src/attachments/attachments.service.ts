import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    taskId: string,
    data: {
      file_url: string;
      file_name: string;
      file_type: string;
      uploaded_by: string;
    },
  ) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return this.prisma.attachment.create({
      data: {
        task_id: taskId,
        file_url: data.file_url,
        file_name: data.file_name,
        file_type: data.file_type,
        uploaded_by: data.uploaded_by,
      },
    });
  }

  async findOne(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }
    return attachment;
  }

  remove(id: string) {
    return this.prisma.attachment.delete({ where: { id } });
  }
}
