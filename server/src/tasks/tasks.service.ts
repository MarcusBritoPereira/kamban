import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AddAssigneeDto } from './dto/add-assignee.dto';
import { AddTagDto } from './dto/add-tag.dto';
import { AddDependencyDto } from './dto/add-dependency.dto';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
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
    const { list_id, assigneeIds, tagIds, parent_task_id, ...data } = createTaskDto;

    // Validate list
    const list = await this.prisma.list.findUnique({ where: { id: list_id } });
    if (!list) {
      throw new NotFoundException(`List with ID ${list_id} not found`);
    }

    const taskData: any = {
      ...data,
      list: { connect: { id: list_id } },
    };

    if (parent_task_id) {
      const parentTask = await this.prisma.task.findUnique({
        where: { id: parent_task_id },
        select: { list_id: true },
      });
      if (!parentTask) {
        throw new NotFoundException(`Parent task with ID ${parent_task_id} not found`);
      }
      if (parentTask.list_id !== list_id) {
        throw new BadRequestException('Subtasks must belong to the same list as their parent task');
      }
      taskData.parent = { connect: { id: parent_task_id } };
    }

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
      include: {
        list: {
          include: {
            folder: {
              include: { space: true }
            }
          }
        }
      }
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
          link: `/spaces/${task.list.folder.space_id}/folders/${task.list.folder_id}/lists/${task.list_id}?openTask=${task.id}`
        });
        // Also log assignment activity? 
        // "Added X to task" - maybe redundant if created with them.
        // Let's stick to "created task".
      }
    }

    return task;
  }

  async findAll(listId?: string, page: number = 1, limit: number = 20) {
    if (!listId) {
      throw new BadRequestException('list_id is required');
    }

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const take = safeLimit;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where: { list_id: listId },
        include: {
          assignees: { include: { user: true } },
          tags: { include: { tag: true } },
          attachments: true,
          subtasks: true,
          checklists: { include: { items: { orderBy: { position: 'asc' } } } },
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
          page: safePage,
          limit: safeLimit,
          lastPage: Math.ceil(total / safeLimit)
        }
      };
  }

  async findAssignedTo(userId: string, page: number = 1, limit: number = 20) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const take = safeLimit;

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
        page: safePage,
        limit: safeLimit,
        lastPage: Math.ceil(total / safeLimit)
      }
    };
  }


  async findAssignedToInAccessibleSpaces(userId: string, requesterId: string, requesterRole: string, page: number = 1, limit: number = 20) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;
    const take = safeLimit;
    const spaceAccessFilter = requesterRole === 'admin'
      ? {}
      : {
          list: {
            folder: {
              space: {
                OR: [
                  { owner_id: requesterId },
                  { members: { some: { user_id: requesterId } } },
                ],
              },
            },
          },
        };

    const where: any = {
      assignees: { some: { user_id: userId } },
      ...spaceAccessFilter,
    };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          assignees: { include: { user: true } },
          tags: { include: { tag: true } },
          attachments: true,
          list: { include: { folder: { include: { space: true } } } }
        },
        orderBy: { deadline: 'asc' },
        skip,
        take
      }),
      this.prisma.task.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        lastPage: Math.ceil(total / safeLimit)
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
        subtasks: true,
        watchers: { include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } } },
        checklists: { include: { items: { orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } },
        time_entries: { include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } }, orderBy: { started_at: 'desc' } },
        blockingDependencies: { include: { blocked_task: true } },
        blockedByDependencies: { include: { blocking_task: true } },
        list: {
          include: {
            folder: {
              include: { space: true }
            }
          }
        }
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
        include: {
          list: {
            include: {
              folder: {
                include: { space: true }
              }
            }
          }
        }
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
          link: `/spaces/${updatedTask.list.folder.space_id}/folders/${updatedTask.list.folder_id}/lists/${updatedTask.list_id}?openTask=${updatedTask.id}`
        });
      }

      return updatedTask;

      // Notify Creator of generic update
      await this.notifyCreator(id, updatedTask.title, 'atualizou a tarefa', actorId, updatedTask.list.folder.space_id, updatedTask.list.folder_id, updatedTask.list_id);

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
    await this.activitiesService.logActivity(taskId, actorId, 'system', 'adicionou um responsável');

    // Notify Creator
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { list: { include: { folder: true } } }
    });
    if (task) {
      await this.notifyCreator(taskId, task.title, 'adicionou um responsável', actorId, task.list.folder.space_id, task.list.folder_id, task.list_id);
    }

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

    // Notify Creator
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { list: { include: { folder: true } } }
    });
    if (task) {
      await this.notifyCreator(taskId, task.title, 'removeu um responsável', actorId, task.list.folder.space_id, task.list.folder_id, task.list_id);
    }

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

    // Notify Creator
    await this.notifyCreator(taskId, task.title, `adicionou etiqueta ${tag.name}`, actorId, task.list.folder.space_id, task.list.folder_id, task.list_id);

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
      include: { task: { include: { list: { include: { folder: true } } } } }
    });
    await this.activitiesService.logActivity(taskId, actorId, 'system', 'removeu etiqueta');

    // Notify Creator
    await this.notifyCreator(taskId, res.task.title, `removeu uma etiqueta da tarefa`, actorId, res.task.list.folder.space_id, res.task.list.folder_id, res.task.list_id);

    return res;
  }

  async addWatcher(taskId: string, userId: string, actorId: string) {
    const watcher = await this.prisma.taskWatcher.upsert({
      where: {
        task_id_user_id: {
          task_id: taskId,
          user_id: userId,
        },
      },
      update: {},
      create: {
        task: { connect: { id: taskId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar_url: true } },
      },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', 'passou a observar esta tarefa');
    return watcher;
  }

  async removeWatcher(taskId: string, userId: string, actorId: string) {
    const watcher = await this.prisma.taskWatcher.delete({
      where: {
        task_id_user_id: {
          task_id: taskId,
          user_id: userId,
        },
      },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', 'deixou de observar esta tarefa');
    return watcher;
  }

  async addDependency(taskId: string, addDependencyDto: AddDependencyDto, actorId: string) {
    if (taskId === addDependencyDto.blocking_task_id) {
      throw new BadRequestException('A task cannot depend on itself');
    }

    const [blockedTask, blockingTask] = await Promise.all([
      this.prisma.task.findUnique({
        where: { id: taskId },
        include: { list: { include: { folder: true } } },
      }),
      this.prisma.task.findUnique({
        where: { id: addDependencyDto.blocking_task_id },
        include: { list: { include: { folder: true } } },
      }),
    ]);

    if (!blockedTask) throw new NotFoundException('Task not found');
    if (!blockingTask) throw new NotFoundException('Blocking task not found');
    if (blockedTask.list.folder.space_id !== blockingTask.list.folder.space_id) {
      throw new BadRequestException('Dependencies must be in the same space');
    }

    const dependency = await this.prisma.taskDependency.create({
      data: {
        blocked_task: { connect: { id: taskId } },
        blocking_task: { connect: { id: addDependencyDto.blocking_task_id } },
        type: addDependencyDto.type || 'blocks',
      },
      include: {
        blocking_task: true,
        blocked_task: true,
      },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', `adicionou dependência de ${blockingTask.title}`);
    return dependency;
  }

  async removeDependency(taskId: string, dependencyId: string, actorId: string) {
    const dependency = await this.prisma.taskDependency.findUnique({
      where: { id: dependencyId },
    });

    if (!dependency || dependency.blocked_task_id !== taskId) {
      throw new NotFoundException('Dependency not found for this task');
    }

    const removed = await this.prisma.taskDependency.delete({
      where: { id: dependencyId },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', 'removeu uma dependência');
    return removed;
  }

  async createChecklist(taskId: string, createChecklistDto: CreateChecklistDto, actorId: string) {
    const checklist = await this.prisma.taskChecklist.create({
      data: {
        task: { connect: { id: taskId } },
        title: createChecklistDto.title,
        position: createChecklistDto.position ?? 0,
      },
      include: { items: true },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', `criou checklist ${checklist.title}`);
    return checklist;
  }

  async removeChecklist(taskId: string, checklistId: string, actorId: string) {
    const checklist = await this.prisma.taskChecklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist || checklist.task_id !== taskId) {
      throw new NotFoundException('Checklist not found for this task');
    }

    const removed = await this.prisma.taskChecklist.delete({
      where: { id: checklistId },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', `removeu checklist ${checklist.title}`);
    return removed;
  }

  async createChecklistItem(taskId: string, checklistId: string, createChecklistItemDto: CreateChecklistItemDto, actorId: string) {
    await this.ensureChecklistBelongsToTask(taskId, checklistId);

    const item = await this.prisma.taskChecklistItem.create({
      data: {
        checklist: { connect: { id: checklistId } },
        title: createChecklistItemDto.title,
        completed: createChecklistItemDto.completed ?? false,
        position: createChecklistItemDto.position ?? 0,
      },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', `adicionou item de checklist ${item.title}`);
    return item;
  }

  async updateChecklistItem(taskId: string, itemId: string, updateChecklistItemDto: UpdateChecklistItemDto, actorId: string) {
    const item = await this.prisma.taskChecklistItem.findUnique({
      where: { id: itemId },
      include: { checklist: true },
    });

    if (!item || item.checklist.task_id !== taskId) {
      throw new NotFoundException('Checklist item not found for this task');
    }

    const updated = await this.prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: updateChecklistItemDto,
    });

    if (updateChecklistItemDto.completed !== undefined && updateChecklistItemDto.completed !== item.completed) {
      await this.activitiesService.logActivity(
        taskId,
        actorId,
        'system',
        updateChecklistItemDto.completed ? `concluiu item ${updated.title}` : `reabriu item ${updated.title}`,
      );
    }

    return updated;
  }

  async removeChecklistItem(taskId: string, itemId: string, actorId: string) {
    const item = await this.prisma.taskChecklistItem.findUnique({
      where: { id: itemId },
      include: { checklist: true },
    });

    if (!item || item.checklist.task_id !== taskId) {
      throw new NotFoundException('Checklist item not found for this task');
    }

    const removed = await this.prisma.taskChecklistItem.delete({
      where: { id: itemId },
    });

    await this.activitiesService.logActivity(taskId, actorId, `system`, `removeu item de checklist ${item.title}`);
    return removed;
  }

  private async ensureChecklistBelongsToTask(taskId: string, checklistId: string) {
    const checklist = await this.prisma.taskChecklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist || checklist.task_id !== taskId) {
      throw new NotFoundException('Checklist not found for this task');
    }
  }

  findTimeEntries(taskId: string) {
    return this.prisma.taskTimeEntry.findMany({
      where: { task_id: taskId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar_url: true } },
      },
      orderBy: { started_at: 'desc' },
    });
  }

  async createTimeEntry(taskId: string, userId: string, createTimeEntryDto: CreateTimeEntryDto) {
    const startedAt = createTimeEntryDto.started_at ? new Date(createTimeEntryDto.started_at) : new Date();
    const endedAt = createTimeEntryDto.ended_at ? new Date(createTimeEntryDto.ended_at) : undefined;
    const duration = this.resolveDurationMinutes(startedAt, endedAt, createTimeEntryDto.duration_minutes);

    const entry = await this.prisma.taskTimeEntry.create({
      data: {
        task: { connect: { id: taskId } },
        user: { connect: { id: userId } },
        started_at: startedAt,
        ended_at: endedAt,
        duration_minutes: duration,
        note: createTimeEntryDto.note,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar_url: true } },
      },
    });

    await this.activitiesService.logActivity(taskId, userId, 'system', `registrou ${duration || 0} minutos nesta tarefa`);
    return entry;
  }

  async updateTimeEntry(taskId: string, timeEntryId: string, updateTimeEntryDto: UpdateTimeEntryDto, actorId: string) {
    const entry = await this.prisma.taskTimeEntry.findUnique({
      where: { id: timeEntryId },
    });

    if (!entry || entry.task_id !== taskId) {
      throw new NotFoundException('Time entry not found for this task');
    }

    const startedAt = updateTimeEntryDto.started_at ? new Date(updateTimeEntryDto.started_at) : entry.started_at;
    const endedAt = updateTimeEntryDto.ended_at ? new Date(updateTimeEntryDto.ended_at) : entry.ended_at || undefined;
    const duration = this.resolveDurationMinutes(startedAt, endedAt, updateTimeEntryDto.duration_minutes ?? entry.duration_minutes ?? undefined);

    const updated = await this.prisma.taskTimeEntry.update({
      where: { id: timeEntryId },
      data: {
        started_at: startedAt,
        ended_at: endedAt,
        duration_minutes: duration,
        note: updateTimeEntryDto.note,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar_url: true } },
      },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', 'atualizou um registro de tempo');
    return updated;
  }

  async removeTimeEntry(taskId: string, timeEntryId: string, actorId: string) {
    const entry = await this.prisma.taskTimeEntry.findUnique({
      where: { id: timeEntryId },
    });

    if (!entry || entry.task_id !== taskId) {
      throw new NotFoundException('Time entry not found for this task');
    }

    const removed = await this.prisma.taskTimeEntry.delete({
      where: { id: timeEntryId },
    });

    await this.activitiesService.logActivity(taskId, actorId, 'system', 'removeu um registro de tempo');
    return removed;
  }

  private resolveDurationMinutes(startedAt: Date, endedAt?: Date, explicitDuration?: number) {
    if (explicitDuration) return explicitDuration;
    if (!endedAt) return undefined;
    if (endedAt <= startedAt) {
      throw new BadRequestException('ended_at must be after started_at');
    }

    return Math.ceil((endedAt.getTime() - startedAt.getTime()) / 60000);
  }

  // --- Helpers for Creator Notification ---

  private async getTaskCreatorId(taskId: string): Promise<string | null> {
    // Infer creator from the first 'system' activity for this task
    // "criou esta tarefa" is the standard message, but simply taking the oldest activity is safer/generic
    const firstActivity = await this.prisma.taskActivity.findFirst({
      where: { task_id: taskId },
      orderBy: { created_at: 'asc' },
    });
    return firstActivity ? firstActivity.user_id : null;
  }

  private async notifyCreator(taskId: string, taskTitle: string, actionDescription: string, actorId: string, spaceId: string, folderId: string, listId: string) {
    try {
      const creatorId = await this.getTaskCreatorId(taskId);
      if (!creatorId || creatorId === actorId) return; // Don't notify if creator is the actor or unknown

      // Verify if actor is "system" or actual user? usually actorId is user.
      // Fetch actor name for better message? For now generic: "Alguém..."
      // Or we can assume the UI/Notification service handles "Who did it" if we just send the message.
      // Let's explicitly say "Um usuário..." or fetch the actor name if cheap. 
      // For performance, we'll keep it simple: "Houve uma atualização na tarefa..."

      await this.notificationsService.create({
        user_id: creatorId,
        title: 'Atualização em Tarefa',
        message: `Membro atualizou a tarefa "${taskTitle}": ${actionDescription}`, // "Membro removeu uma etiqueta..."
        type: 'info', // or 'update'
        link: `/spaces/${spaceId}/folders/${folderId}/lists/${listId}?openTask=${taskId}`
      });
    } catch (e) {
      console.error('Error notifying creator:', e);
      // Suppress error to not block main flow
    }
  }
}
