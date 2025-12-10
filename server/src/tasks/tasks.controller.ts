import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AddAssigneeDto } from './dto/add-assignee.dto';
import { AddTagDto } from './dto/add-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Roles(Role.admin, Role.gestor, Role.editor)
  @Post('lists/:listId/tasks')
  create(
    @Param('listId') listId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    createTaskDto.list_id = listId;
    return this.tasksService.create(createTaskDto);
  }

  @Get('lists/:listId/tasks')
  findAllByList(@Param('listId') listId: string) {
    return this.tasksService.findAll(listId);
  }

  @Get('tasks/:id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Roles(Role.admin, Role.gestor, Role.editor)
  @Patch('tasks/:id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Roles(Role.admin, Role.gestor)
  @Delete('tasks/:id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  // Assignees
  @Roles(Role.admin, Role.gestor)
  @Post('tasks/:id/assignees')
  addAssignee(@Param('id') id: string, @Body() addAssigneeDto: AddAssigneeDto) {
    return this.tasksService.addAssignee(id, addAssigneeDto);
  }

  @Roles(Role.admin, Role.gestor)
  @Delete('tasks/:taskId/assignees/:userId')
  removeAssignee(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string,
  ) {
    return this.tasksService.removeAssignee(taskId, userId);
  }

  // Tags
  @Roles(Role.admin, Role.gestor, Role.editor)
  @Post('tasks/:id/tags')
  addTag(@Param('id') id: string, @Body() addTagDto: AddTagDto) {
    return this.tasksService.addTag(id, addTagDto);
  }

  @Roles(Role.admin, Role.gestor, Role.editor)
  @Delete('tasks/:taskId/tags/:tagId')
  removeTag(@Param('taskId') taskId: string, @Param('tagId') tagId: string) {
    return this.tasksService.removeTag(taskId, tagId);
  }
}
