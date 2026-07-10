import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  PermissionsService,
  SpaceRole,
} from '../permissions/permissions.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@UseGuards(JwtAuthGuard)
@Controller('v1')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get('spaces/:spaceId/tags')
  async findAll(
    @Param('spaceId') spaceId: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    const hasAccess = await this.permissionsService.hasAccess(
      req.user.id,
      spaceId,
      SpaceRole.VIEWER,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem acesso a este espaço.',
      );
    }

    return this.tagsService.findAll(spaceId);
  }

  @Post('spaces/:spaceId/tags')
  async create(
    @Param('spaceId') spaceId: string,
    @Body() data: { name: string; color: string },
    @Request() req: { user: AuthenticatedUser },
  ) {
    const hasAccess = await this.permissionsService.hasAccess(
      req.user.id,
      spaceId,
      SpaceRole.EDITOR,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para criar etiquetas neste espaço.',
      );
    }

    return this.tagsService.create(spaceId, data);
  }

  @Put('tags/:id')
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; color?: string },
    @Request() req: { user: AuthenticatedUser },
  ) {
    const tag = await this.tagsService.findById(id);

    if (!tag.space_id) {
      throw new ForbiddenException(
        'Esta etiqueta não está vinculada a um espaço válido.',
      );
    }

    const hasAccess = await this.permissionsService.hasAccess(
      req.user.id,
      tag.space_id,
      SpaceRole.EDITOR,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para editar esta etiqueta.',
      );
    }

    return this.tagsService.update(id, data);
  }

  @Delete('tags/:id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    const tag = await this.tagsService.findById(id);

    if (!tag.space_id) {
      throw new ForbiddenException(
        'Esta etiqueta não está vinculada a um espaço válido.',
      );
    }

    const hasAccess = await this.permissionsService.hasAccess(
      req.user.id,
      tag.space_id,
      SpaceRole.EDITOR,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir esta etiqueta.',
      );
    }

    return this.tagsService.remove(id);
  }
}
