import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { SpaceRole } from '../auth/decorators/space-role.decorator';

@UseGuards(JwtAuthGuard)
@Controller('v1')
export class ListsController {
  constructor(private readonly listsService: ListsService) { }

  @Post('folders/:folderId/lists')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
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
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('VIEWER')
  findOne(@Param('id') id: string) {
    return this.listsService.findOne(id);
  }

  @Put('lists/:id')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    return this.listsService.update(id, updateListDto);
  }

  @Delete('lists/:id')
  @UseGuards(SpaceRoleGuard)
  @SpaceRole('EDITOR')
  remove(@Param('id') id: string) {
    return this.listsService.remove(id);
  }
}
