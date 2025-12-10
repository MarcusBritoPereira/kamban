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
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Roles(Role.admin, Role.gestor)
  @Post('folders/:folderId/lists')
  create(
    @Param('folderId') folderId: string,
    @Body() createListDto: CreateListDto,
  ) {
    createListDto.folder_id = folderId;
    return this.listsService.create(createListDto);
  }

  @Get('folders/:folderId/lists')
  findAllByFolder(@Param('folderId') folderId: string) {
    return this.listsService.findAll(folderId);
  }

  @Get('lists/:id')
  findOne(@Param('id') id: string) {
    return this.listsService.findOne(id);
  }

  @Roles(Role.admin, Role.gestor)
  @Put('lists/:id')
  update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    return this.listsService.update(id, updateListDto);
  }

  @Roles(Role.admin, Role.gestor)
  @Delete('lists/:id')
  remove(@Param('id') id: string) {
    return this.listsService.remove(id);
  }
}
