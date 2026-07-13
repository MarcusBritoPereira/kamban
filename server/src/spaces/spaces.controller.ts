import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import {
  PermissionsService,
  SpaceRole,
} from '../permissions/permissions.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/spaces')
export class SpacesController {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Roles(Role.admin, Role.gestor)
  @Post()
  create(@Body() createSpaceDto: CreateSpaceDto, @Request() req: any) {
    const user = req.user as { id: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    return this.spacesService.create(createSpaceDto, user.id);
  }

  @Get()
  findAll(@Request() req: any) {
    const user = req.user as { id: string; role: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    return this.spacesService.findAll(user.id, user.role);
  }

  @Get(':id/statuses')
  async findStatuses(@Param('id') id: string, @Request() req: any) {
    const user = req.user as { id: string };
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.VIEWER,
    );
    if (!hasAccess)
      throw new ForbiddenException('You do not have access to this space');

    return this.spacesService.findStatuses(id);
  }

  @Post(':id/statuses')
  async createStatus(
    @Param('id') id: string,
    @Body()
    data: {
      name: string;
      color?: string;
      position?: number;
      is_default?: boolean;
    },
    @Request() req: any,
  ) {
    const user = req.user as { id: string };
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.ADMIN,
    );
    if (!hasAccess)
      throw new ForbiddenException('Only Admins or Owners can manage statuses');

    return this.spacesService.createStatus(id, data);
  }

  @Patch(':id/statuses/:statusId')
  async updateStatus(
    @Param('id') id: string,
    @Param('statusId') statusId: string,
    @Body()
    data: {
      name?: string;
      color?: string;
      position?: number;
      is_default?: boolean;
    },
    @Request() req: any,
  ) {
    const user = req.user as { id: string };
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.ADMIN,
    );
    if (!hasAccess)
      throw new ForbiddenException('Only Admins or Owners can manage statuses');

    return this.spacesService.updateStatus(id, statusId, data);
  }

  @Delete(':id/statuses/:statusId')
  async removeStatus(
    @Param('id') id: string,
    @Param('statusId') statusId: string,
    @Request() req: any,
  ) {
    const user = req.user as { id: string };
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.ADMIN,
    );
    if (!hasAccess)
      throw new ForbiddenException('Only Admins or Owners can manage statuses');

    return this.spacesService.removeStatus(id, statusId);
  }

  @Get(':id/custom-fields')
  async findCustomFields(@Param('id') id: string, @Request() req: any) {
    const user = req.user as { id: string };
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.VIEWER,
    );
    if (!hasAccess)
      throw new ForbiddenException('You do not have access to this space');

    return this.spacesService.findCustomFields(id);
  }

  @Post(':id/custom-fields')
  async createCustomField(
    @Param('id') id: string,
    @Body()
    data: {
      name: string;
      type: string;
      options?: unknown;
      required?: boolean;
      position?: number;
    },
    @Request() req: any,
  ) {
    const user = req.user as { id: string };
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.ADMIN,
    );
    if (!hasAccess)
      throw new ForbiddenException(
        'Only Admins or Owners can manage custom fields',
      );

    return this.spacesService.createCustomField(id, data);
  }

  @Patch(':id/custom-fields/:fieldId')
  async updateCustomField(
    @Param('id') id: string,
    @Param('fieldId') fieldId: string,
    @Body()
    data: {
      name?: string;
      type?: string;
      options?: unknown;
      required?: boolean;
      position?: number;
    },
    @Request() req: any,
  ) {
    const user = req.user as { id: string };
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.ADMIN,
    );
    if (!hasAccess)
      throw new ForbiddenException(
        'Only Admins or Owners can manage custom fields',
      );

    return this.spacesService.updateCustomField(id, fieldId, data);
  }

  @Delete(':id/custom-fields/:fieldId')
  async removeCustomField(
    @Param('id') id: string,
    @Param('fieldId') fieldId: string,
    @Request() req: any,
  ) {
    const user = req.user as { id: string };
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.ADMIN,
    );
    if (!hasAccess)
      throw new ForbiddenException(
        'Only Admins or Owners can manage custom fields',
      );

    return this.spacesService.removeCustomField(id, fieldId);
  }

  @Get('invitations/me')
  findMyInvitations(@Request() req: any) {
    const user = req.user as { email: string };
    return this.spacesService.findInvitationsForUser(user.email);
  }

  @Post('invitations/:token/accept')
  acceptInvitation(@Param('token') token: string, @Request() req: any) {
    const user = req.user as { id: string; email: string };
    return this.spacesService.acceptInvitation(token, user.id, user.email);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const user = req.user as { id: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.VIEWER,
    );
    if (!hasAccess)
      throw new ForbiddenException('You do not have access to this space');

    return this.spacesService.findOne(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req: any) {
    const user = req.user as { id: string };
    // Check access (Viewer or above can see members)
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.VIEWER,
    );
    if (!hasAccess)
      throw new ForbiddenException('You do not have access to this space');

    return this.spacesService.findMembers(id);
  }

  @Roles(Role.admin, Role.gestor)
  @Post(':id/members')
  async invite(
    @Param('id') id: string,
    @Body('email') email: string,
    @Request() req: any,
  ) {
    const user = req.user as { id: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    // Only Owner or Admin can add members
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.ADMIN,
    );
    if (!hasAccess)
      throw new ForbiddenException('Only Admins or Owners can invite members');

    return this.spacesService.inviteMember(id, email, user.id);
  }

  @Roles(Role.admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
    @Request() req: any,
  ) {
    const user = req.user as { id: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.EDITOR,
    );
    if (!hasAccess)
      throw new ForbiddenException(
        'Insufficient permissions update this space',
      );

    return this.spacesService.update(id, updateSpaceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const user = req.user as { id: string; role: string };

    // Global Admin can delete any space
    if (user.role === 'admin') {
      return this.spacesService.remove(id);
    }

    // Only Owner can delete space
    const hasAccess = await this.permissionsService.hasAccess(
      user.id,
      id,
      SpaceRole.OWNER,
    );
    if (!hasAccess)
      throw new ForbiddenException('Only the Owner can delete this space');

    return this.spacesService.remove(id);
  }
}
