import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Roles(Role.admin, Role.gestor)
  @Post('spaces/:spaceId/folders')
  create(
    @Param('spaceId') spaceId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    // Ensure the spaceId in the URL overrides or matches the body
    createFolderDto.space_id = spaceId;
    return this.foldersService.create(createFolderDto);
  }

  @Get('spaces/:spaceId/folders')
  isAuthenticated(@Param('spaceId') spaceId: string) {
    return this.foldersService.findAll(spaceId);
  }

  // General folders endpoints
  @Get('folders/:id')
  findOne(@Param('id') id: string) {
    return this.foldersService.findOne(id);
  }

  @Roles(Role.admin, Role.gestor)
  @Put('folders/:id')
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto) {
    return this.foldersService.update(id, updateFolderDto);
  }

  @Roles(Role.admin)
  @Delete('folders/:id')
  remove(@Param('id') id: string) {
    return this.foldersService.remove(id);
  }
}
