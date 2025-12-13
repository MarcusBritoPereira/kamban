import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AddAssigneeDto } from './dto/add-assignee.dto';
import { AddTagDto } from './dto/add-tag.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private activitiesService: ActivitiesService
  ) { }

  async create(createTaskDto: CreateTaskDto, actorId: string) {
    const { list_id, assigneeIds, tagIds, ...data } = createTaskDto;

    // Validate list
    const list = await this.prisma.list.findUnique({ where: { id: list_id } });
    if (!list) {
      throw new NotFoundException(`List with ID ${list_id} not found`);
    }

    const taskData: any = {
      ...data,
      list: { connect: { id: list_id } },
    };

    if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      const validIds = assigneeIds.filter(id => id && id.length > 0);
      if (validIds.length > 0) {
        taskData.assignees = {
          create: validIds.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        };
      }
    }

    // Handle Tags
    if (createTaskDto.tagIds && Array.isArray(createTaskDto.tagIds) && createTaskDto.tagIds.length > 0) {
      const validTagIds = createTaskDto.tagIds.filter(id => id && id.length > 0);
      if (validTagIds.length > 0) {
        taskData.tags = {
          create: validTagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        };
      }
    }

    const task = await this.prisma.task.create({
      data: taskData,
      include: { list: true }
    });

    // Log Activity
    await this.activitiesService.logActivity(task.id, actorId, 'system', 'criou esta tarefa');

    // Notify assignees
    if (assigneeIds && assigneeIds.length > 0) {
      for (const userId of assigneeIds) {
        if (!userId || userId === actorId) continue; // Don't notify self
        await this.notificationsService.create({
          user_id: userId,
          title: 'Nova Tarefa Atribuída',
          message: `Você foi atribuído à tarefa "${task.title}"`,
          type: 'assignment',
          link: `/tasks/${task.id}`
        });
        // Also log assignment activity? 
        // "Added X to task" - maybe redundant if created with them.
        // Let's stick to "created task".
      }
    }

    return task;
  }

  async findAll(listId?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const take = limit;

    if (listId) {
      const [data, total] = await Promise.all([
        this.prisma.task.findMany({
          where: { list_id: listId },
          include: {
            assignees: { include: { user: true } },
            tags: { include: { tag: true } },
            attachments: true,
          },
          skip,
          take,
          orderBy: { created_at: 'desc' } // Deterministic ordering
        }),
        this.prisma.task.count({ where: { list_id: listId } })
      ]);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit)
        }
      };
    }

    // Fallback for "all tasks" (admin use?)
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        include: {
          assignees: { include: { user: true } },
          tags: { include: { tag: true } },
          attachments: true,
        },
        skip,
        take,
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.task.count()
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit)
      }
    };
  }

  async findAssignedTo(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          assignees: {
            some: {
              user_id: userId,
            },
          },
        },
        include: {
          assignees: { include: { user: true } },
          tags: { include: { tag: true } },
          attachments: true,
          list: { include: { folder: { include: { space: true } } } } // Include context for "My Tasks" view
        },
        orderBy: { deadline: 'asc' },
        skip,
        take
      }),
      this.prisma.task.count({
        where: {
          assignees: {
            some: { user_id: userId }
          }
        }
      })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit)
      }
    };
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: { include: { user: true } },
        tags: { include: { tag: true } },
        attachments: true,
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, actorId: string) {
    const { assigneeIds, tagIds, ...data } = updateTaskDto;

    // 1. Fetch current task to compare
    const currentTask = await this.prisma.task.findUnique({
      where: { id },
      include: { assignees: true, tags: true }
    });
    if (!currentTask) throw new NotFoundException('Task not found');

    const updateData: any = { ...data };
    let newAssignees: string[] = [];

    // Handle Assignees
    if (assigneeIds && Array.isArray(assigneeIds)) {
      const currentAssigneeIds = currentTask.assignees.map(a => a.user_id) || [];
      newAssignees = assigneeIds.filter(uid => !currentAssigneeIds.includes(uid));
      const removedAssignees = currentAssigneeIds.filter(uid => !assigneeIds.includes(uid));

      updateData.assignees = {
        deleteMany: {}, // Clear existing
        create: assigneeIds.filter(uid => uid).map((userId) => ({
          user: { connect: { id: userId } },
        })),
      };

      // Log removal? Difficult to get names here efficiently without extra queries.
      // We'll trust the user sees the final state or we could look up names.
      if (removedAssignees.length > 0) {
        // Simplified logging
        await this.activitiesService.logActivity(id, actorId, 'system', `removeu responsáveis`);
      }
      if (newAssignees.length > 0) {
        // We can improve this by resolving names if needed, or just "atribuiu novos responsáveis"
        await this.activitiesService.logActivity(id, actorId, 'system', `atribuiu responsáveis`);
      }
    }

    // Handle Tags
    if (updateTaskDto.tagIds && Array.isArray(updateTaskDto.tagIds)) {
      updateData.tags = {
        deleteMany: {},
        create: updateTaskDto.tagIds.filter(tid => tid).map(tagId => ({
          tag: { connect: { id: tagId } }
        }))
      };
      // Simple log
      // await this.activitiesService.logActivity(id, actorId, 'system', 'atualizou as etiquetas');
    }

    try {
      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: updateData,
      });

      // Log Field Changes
      if (data.status && data.status !== currentTask.status) {
        await this.activitiesService.logActivity(id, actorId, 'system', `alterou o status para ${data.status}`);
      }
      if (data.priority && data.priority !== currentTask.priority) {
        await this.activitiesService.logActivity(id, actorId, 'system', `alterou a prioridade para ${data.priority}`);
      }
      if (data.deadline && new Date(data.deadline).getTime() !== new Date(currentTask.deadline || 0).getTime()) {
        await this.activitiesService.logActivity(id, actorId, 'system', `definiu a data final como ${new Date(data.deadline).toLocaleDateString()}`);
      }
      // Description is verbose, maybe just "updated description"
      if (data.description !== undefined && data.description !== currentTask.description) {
        // await this.activitiesService.logActivity(id, actorId, 'system', `editou a descrição`);
      }


      // Notify NEW assignees
      for (const userId of newAssignees) {
        if (!userId || userId === actorId) continue;
        await this.notificationsService.create({
          user_id: userId,
          title: 'Tarefa Atribuída',
          message: `Você foi atribuído à tarefa "${updatedTask.title}"`,
          type: 'assignment',
          link: `/tasks/${updatedTask.id}`
        });
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  async addAssignee(taskId: string, addAssigneeDto: AddAssigneeDto, actorId: string) {
    const res = await this.prisma.taskAssignee.create({
      data: {
        task: { connect: { id: taskId } },
        user: { connect: { id: addAssigneeDto.user_id } },
      },
    });
    // Log
    // We could fetch the user name being assigned to make it nicer: "Assigned John Doe"
    // For now:
    await this.activitiesService.logActivity(taskId, actorId, 'system', 'adicionou um responsável');
    return res;
  }

  async removeAssignee(taskId: string, userId: string, actorId: string) {
    const res = await this.prisma.taskAssignee.delete({
      where: {
        task_id_user_id: {
          task_id: taskId,
          user_id: userId,
        },
      },
    });
    await this.activitiesService.logActivity(taskId, actorId, 'system', 'removeu um responsável');
    return res;
  }

  async addTag(taskId: string, addTagDto: AddTagDto, actorId: string) {
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
    const res = await this.prisma.taskTag.create({
      data: {
        task: { connect: { id: taskId } },
        tag: { connect: { id: tag.id } },
      },
    });
    await this.activitiesService.logActivity(taskId, actorId, 'system', `adicionou etiqueta ${tag.name}`);
    return res;
  }

  async removeTag(taskId: string, tagId: string, actorId: string) {
    const res = await this.prisma.taskTag.delete({
      where: {
        task_id_tag_id: {
          task_id: taskId,
          tag_id: tagId,
        },
      },
    });
    await this.activitiesService.logActivity(taskId, actorId, 'system', 'removeu etiqueta');
    return res;
  }
}
