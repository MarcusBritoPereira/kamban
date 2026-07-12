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
import { AddDependencyDto } from './dto/add-dependency.dto';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { SpaceRole } from '../auth/decorators/space-role.decorator';

@UseGuards(JwtAuthGuard)
@Controller('v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

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
  findUserTasks(@Param('userId') userId: string, @Request() req: any) {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50; // Higher limit for profile view
    return this.tasksService.findAssignedToInAccessibleSpaces(
      userId,
      req.user.id,
      req.user.role,
      page,
      limit,
    );
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
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
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
  addAssignee(
    @Param('id') id: string,
    @Body() addAssigneeDto: AddAssigneeDto,
    @Request() req: any,
  ) {
    return this.tasksService.addAssignee(id, addAssigneeDto, req.user.id);
  }

  @Delete(':id/assignees/:userId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeAssignee(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.tasksService.removeAssignee(id, userId, req.user.id);
  }

  @Post(':id/tags')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  addTag(
    @Param('id') id: string,
    @Body() addTagDto: AddTagDto,
    @Request() req: any,
  ) {
    return this.tasksService.addTag(id, addTagDto, req.user.id);
  }

  @Delete(':id/tags/:tagId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @Request() req: any,
  ) {
    return this.tasksService.removeTag(id, tagId, req.user.id);
  }

  @Post(':id/watchers')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  watchTask(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.addWatcher(id, req.user.id, req.user.id);
  }

  @Delete(':id/watchers')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  unwatchTask(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.removeWatcher(id, req.user.id, req.user.id);
  }

  @Post(':id/dependencies')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  addDependency(
    @Param('id') id: string,
    @Body() addDependencyDto: AddDependencyDto,
    @Request() req: any,
  ) {
    return this.tasksService.addDependency(id, addDependencyDto, req.user.id);
  }

  @Delete(':id/dependencies/:dependencyId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeDependency(
    @Param('id') id: string,
    @Param('dependencyId') dependencyId: string,
    @Request() req: any,
  ) {
    return this.tasksService.removeDependency(id, dependencyId, req.user.id);
  }

  @Post(':id/checklists')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  createChecklist(
    @Param('id') id: string,
    @Body() createChecklistDto: CreateChecklistDto,
    @Request() req: any,
  ) {
    return this.tasksService.createChecklist(
      id,
      createChecklistDto,
      req.user.id,
    );
  }

  @Delete(':id/checklists/:checklistId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeChecklist(
    @Param('id') id: string,
    @Param('checklistId') checklistId: string,
    @Request() req: any,
  ) {
    return this.tasksService.removeChecklist(id, checklistId, req.user.id);
  }

  @Post(':id/checklists/:checklistId/items')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  createChecklistItem(
    @Param('id') id: string,
    @Param('checklistId') checklistId: string,
    @Body() createChecklistItemDto: CreateChecklistItemDto,
    @Request() req: any,
  ) {
    return this.tasksService.createChecklistItem(
      id,
      checklistId,
      createChecklistItemDto,
      req.user.id,
    );
  }

  @Patch(':id/checklist-items/:itemId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  updateChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() updateChecklistItemDto: UpdateChecklistItemDto,
    @Request() req: any,
  ) {
    return this.tasksService.updateChecklistItem(
      id,
      itemId,
      updateChecklistItemDto,
      req.user.id,
    );
  }

  @Delete(':id/checklist-items/:itemId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Request() req: any,
  ) {
    return this.tasksService.removeChecklistItem(id, itemId, req.user.id);
  }

  @Get(':id/custom-fields')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  findCustomFieldValues(@Param('id') id: string) {
    return this.tasksService.findCustomFieldValues(id);
  }

  @Patch(':id/custom-fields/:fieldId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  setCustomFieldValue(
    @Param('id') id: string,
    @Param('fieldId') fieldId: string,
    @Body('value') value: unknown,
    @Request() req: any,
  ) {
    return this.tasksService.setCustomFieldValue(
      id,
      fieldId,
      value,
      req.user.id,
    );
  }

  @Delete(':id/custom-fields/:fieldId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeCustomFieldValue(
    @Param('id') id: string,
    @Param('fieldId') fieldId: string,
    @Request() req: any,
  ) {
    return this.tasksService.removeCustomFieldValue(id, fieldId, req.user.id);
  }

  @Get(':id/time-entries')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  findTimeEntries(@Param('id') id: string) {
    return this.tasksService.findTimeEntries(id);
  }

  @Post(':id/time-entries')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  createTimeEntry(
    @Param('id') id: string,
    @Body() createTimeEntryDto: CreateTimeEntryDto,
    @Request() req: any,
  ) {
    return this.tasksService.createTimeEntry(
      id,
      req.user.id,
      createTimeEntryDto,
    );
  }

  @Patch(':id/time-entries/:timeEntryId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  updateTimeEntry(
    @Param('id') id: string,
    @Param('timeEntryId') timeEntryId: string,
    @Body() updateTimeEntryDto: UpdateTimeEntryDto,
    @Request() req: any,
  ) {
    return this.tasksService.updateTimeEntry(
      id,
      timeEntryId,
      updateTimeEntryDto,
      req.user.id,
    );
  }

  @Delete(':id/time-entries/:timeEntryId')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  removeTimeEntry(
    @Param('id') id: string,
    @Param('timeEntryId') timeEntryId: string,
    @Request() req: any,
  ) {
    return this.tasksService.removeTimeEntry(id, timeEntryId, req.user.id);
  }
}
