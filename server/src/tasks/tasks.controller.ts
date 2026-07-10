import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AddAssigneeDto } from './dto/add-assignee.dto';
import { AddTagDto } from './dto/add-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { SpaceRole } from '../auth/decorators/space-role.decorator';

@UseGuards(JwtAuthGuard)
@Controller('v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  findAll(@Request() req: any) {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    return this.tasksService.findAll(req.query.list_id, page, limit);
  }

  @Get('me')
  findMyTasks(@Request() req: any) {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    return this.tasksService.findAssignedTo(req.user.id, page, limit);
  }

  @Get('user/:userId')
  @UseGuards(SpaceRoleGuard) // Assuming we want basic auth
  @SpaceRole('VIEWER') // Or higher?
  findUserTasks(@Param('userId') userId: string, @Request() req: any) {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50; // Higher limit for profile view
    return this.tasksService.findAssignedTo(userId, page, limit);
  }

  @Get(':id')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/assignees')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  addAssignee(@Param('id') id: string, @Body() addAssigneeDto: AddAssigneeDto, @Request() req: any) {
    return this.tasksService.addAssignee(id, addAssigneeDto, req.user.id);
  }

  @Delete(':id/assignees/:userId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeAssignee(@Param('id') id: string, @Param('userId') userId: string, @Request() req: any) {
    return this.tasksService.removeAssignee(id, userId, req.user.id);
  }

  @Post(':id/tags')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  addTag(@Param('id') id: string, @Body() addTagDto: AddTagDto, @Request() req: any) {
    return this.tasksService.addTag(id, addTagDto, req.user.id);
  }

  @Delete(':id/tags/:tagId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeTag(@Param('id') id: string, @Param('tagId') tagId: string, @Request() req: any) {
    return this.tasksService.removeTag(id, tagId, req.user.id);
  }
}
