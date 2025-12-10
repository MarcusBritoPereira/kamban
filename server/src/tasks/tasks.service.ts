import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AddAssigneeDto } from './dto/add-assignee.dto';
import { AddTagDto } from './dto/add-tag.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const { list_id, ...data } = createTaskDto;

    // Validate list
    const list = await this.prisma.list.findUnique({ where: { id: list_id } });
    if (!list) {
      throw new NotFoundException(`List with ID ${list_id} not found`);
    }

    return this.prisma.task.create({
      data: {
        ...data,
        list: { connect: { id: list_id } },
      },
    });
  }

  findAll(listId?: string) {
    if (listId) {
      return this.prisma.task.findMany({
        where: { list_id: listId },
        include: {
          assignees: { include: { user: true } },
          tags: { include: { tag: true } },
        },
      });
    }
    return this.prisma.task.findMany({
      include: {
        assignees: { include: { user: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: { include: { user: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  async addAssignee(taskId: string, addAssigneeDto: AddAssigneeDto) {
    return this.prisma.taskAssignee.create({
      data: {
        task: { connect: { id: taskId } },
        user: { connect: { id: addAssigneeDto.user_id } },
      },
    });
  }

  async removeAssignee(taskId: string, userId: string) {
    return this.prisma.taskAssignee.delete({
      where: {
        task_id_user_id: {
          task_id: taskId,
          user_id: userId,
        },
      },
    });
  }

  async addTag(taskId: string, addTagDto: AddTagDto) {
    // Find the space for this task
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { list: { include: { folder: true } } },
    });

    if (!task) throw new NotFoundException('Task not found');

    const spaceId = task.list.folder.space_id;

    // Find or create tag in this space
    let tag = await this.prisma.tag.findFirst({
      where: { space_id: spaceId, name: addTagDto.name },
    });

    if (!tag) {
      tag = await this.prisma.tag.create({
        data: {
          name: addTagDto.name,
          color: addTagDto.color,
          space: { connect: { id: spaceId } },
        },
      });
    }

    // Link tag to task
    return this.prisma.taskTag.create({
      data: {
        task: { connect: { id: taskId } },
        tag: { connect: { id: tag.id } },
      },
    });
  }

  async removeTag(taskId: string, tagId: string) {
    return this.prisma.taskTag.delete({
      where: {
        task_id_tag_id: {
          task_id: taskId,
          tag_id: tagId,
        },
      },
    });
  }
}
