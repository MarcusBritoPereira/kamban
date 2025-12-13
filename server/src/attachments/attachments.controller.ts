import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) { }

  @Roles(Role.admin, Role.gestor, Role.editor)
  @Post('tasks/:taskId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/tasks',
        filename: (req: any, file: any, cb: any) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Param('taskId') taskId: string,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) throw new Error('File not provided');
    const fileUrl = `/uploads/tasks/${file.filename}`;
    return this.attachmentsService.create(taskId, {
      file_url: fileUrl,
      file_name: file.originalname,
      file_type: file.mimetype,
      uploaded_by: req.user.name
    });
  }

  @Roles(Role.admin, Role.gestor)
  @Delete('attachments/:id')
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
