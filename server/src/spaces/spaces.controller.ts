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
  NotFoundException,
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
  ) { }

  @Roles(Role.admin, Role.gestor)
  @Post()
  create(@Body() createSpaceDto: CreateSpaceDto, @Request() req: any) {
    const user = req.user as { sub: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    return this.spacesService.create(createSpaceDto, user.sub);
  }

  @Get()
  findAll(@Request() req: any) {
    const user = req.user as { sub: string; role: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    return this.spacesService.findAll(user.sub, user.role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const user = req.user as { sub: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    const hasAccess = await this.permissionsService.hasAccess(
      user.sub,
      id,
      SpaceRole.VIEWER,
    );
    if (!hasAccess)
      throw new ForbiddenException('You do not have access to this space');

    return this.spacesService.findOne(id);
  }

  @Roles(Role.admin, Role.gestor)
  @Post(':id/members')
  async invite(
    @Param('id') id: string,
    @Body('email') email: string,
    @Request() req: any,
  ) {
    const user = req.user as { sub: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    // Only Owner or Admin can add members
    const hasAccess = await this.permissionsService.hasAccess(
      user.sub,
      id,
      SpaceRole.ADMIN,
    );
    if (!hasAccess)
      throw new ForbiddenException('Only Admins or Owners can invite members');

    try {
      return await this.spacesService.addMember(id, email);
    } catch (error) {
      const err = error as { message?: string };
      if (err.message && err.message.includes('User not found')) {
        throw new NotFoundException(err.message);
      }
      throw error;
    }
  }

  @Roles(Role.admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
    @Request() req: any,
  ) {
    const user = req.user as { sub: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    const hasAccess = await this.permissionsService.hasAccess(
      user.sub,
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
    const user = req.user as { sub: string }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
    // Only Owner can delete space
    const hasAccess = await this.permissionsService.hasAccess(
      user.sub,
      id,
      SpaceRole.OWNER,
    );
    if (!hasAccess)
      throw new ForbiddenException('Only the Owner can delete this space');

    return this.spacesService.remove(id);
  }
}
