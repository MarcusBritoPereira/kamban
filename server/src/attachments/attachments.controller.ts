import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { SpaceRole } from '../auth/decorators/space-role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';

@UseGuards(JwtAuthGuard)
@Controller('v1')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  @Post('tasks/:taskId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './uploads/tasks',
        filename: (req: any, file: any, cb: any) => {
          return cb(
            null,
            `${randomBytes(16).toString('hex')}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
    }),
  )
  create(
    @Param('taskId') taskId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(pdf|png|jpe?g|gif|webp|txt|csv|docx?|xlsx?)$/i,
          }),
        ],
      }),
    )
    file: any,
    @Request() req: any,
  ) {
    const fileUrl = `/uploads/tasks/${file.filename}`;
    return this.attachmentsService.create(taskId, {
      file_url: fileUrl,
      file_name: file.originalname,
      file_type: file.mimetype,
      uploaded_by: req.user.name,
    });
  }

  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  @Get('attachments/:id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const attachment = await this.attachmentsService.findOne(id);
    const fileName = attachment.file_url.split('/').pop();
    return res.download(
      join(process.cwd(), 'uploads', 'tasks', fileName ?? ''),
      attachment.file_name,
    );
  }

  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  @Delete('attachments/:id')
  async remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
