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
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { SpaceRole } from '../auth/decorators/space-role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('v1')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) { }

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
      uploaded_by: req.user.name
    });
  }

  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  @Delete('attachments/:id')
  async remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
