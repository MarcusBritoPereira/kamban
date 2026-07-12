import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Post,
  UseInterceptors,
  UploadedFile,
  Request,
  ForbiddenException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin) // All endpoints here are Admin only
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('directory')
  @Roles(Role.admin, Role.gestor, Role.editor, Role.leitor) // Accessible to all authenticated
  getDirectory() {
    return this.usersService.getDirectory();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: { role?: Role; name?: string; email?: string },
  ) {
    return this.usersService.update(id, updateData);
  }

  @Post(':id/avatar')
  @Roles(Role.admin, Role.gestor, Role.editor, Role.leitor)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req: any, file: any, cb: any) => {
          return cb(
            null,
            `${randomBytes(16).toString('hex')}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
    }),
  )
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(png|jpe?g|gif|webp)$/i }),
        ],
      }),
    )
    file: any,
    @Request() req: any,
  ) {
    if (req.user.role !== Role.admin && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own avatar');
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(id, avatarUrl);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
