import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) { }

  async create(taskId: string, data: { file_url: string, file_name: string, file_type: string, uploaded_by: string }) {
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

  remove(id: string) {
    return this.prisma.attachment.delete({ where: { id } });
  }
}
