import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  PermissionsService,
  SpaceRole,
} from '../permissions/permissions.service';

@UseGuards(JwtAuthGuard)
@Controller('v1')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get('spaces/:spaceId/tags')
  async findAll(@Param('spaceId') spaceId: string, @Request() req: any) {
    await this.ensureSpaceAccess(req.user, spaceId, SpaceRole.VIEWER);
    return this.tagsService.findAll(spaceId);
  }

  @Post('spaces/:spaceId/tags')
  async create(
    @Param('spaceId') spaceId: string,
    @Body() data: { name: string; color: string },
    @Request() req: any,
  ) {
    await this.ensureSpaceAccess(req.user, spaceId, SpaceRole.EDITOR);
    return this.tagsService.create(spaceId, data);
  }

  @Put('tags/:id')
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; color?: string },
    @Request() req: any,
  ) {
    const tag = await this.tagsService.findOne(id);
    await this.ensureSpaceAccess(req.user, tag.space_id, SpaceRole.EDITOR);
    return this.tagsService.update(id, data);
  }

  @Delete('tags/:id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const tag = await this.tagsService.findOne(id);
    await this.ensureSpaceAccess(req.user, tag.space_id, SpaceRole.EDITOR);
    return this.tagsService.remove(id);
  }

  private async ensureSpaceAccess(
    user: { id?: string; sub?: string },
    spaceId: string | null,
    role: SpaceRole,
  ) {
    const userId = user.id ?? user.sub;
    if (!userId || !spaceId) {
      throw new ForbiddenException('You do not have access to this space');
    }

    const hasAccess = await this.permissionsService.hasAccess(
      userId,
      spaceId,
      role,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this space');
    }
  }
}
