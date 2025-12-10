import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Roles(Role.admin, Role.gestor, Role.editor)
  @Post('tasks/:taskId/attachments')
  create(
    @Param('taskId') taskId: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ) {
    return this.attachmentsService.create(taskId, createAttachmentDto);
  }

  @Roles(Role.admin, Role.gestor)
  @Delete('attachments/:id')
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
