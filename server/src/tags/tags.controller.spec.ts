import { ForbiddenException } from '@nestjs/common';
import { SpaceRole } from '../permissions/permissions.service';
import { TagsController } from './tags.controller';

describe('TagsController tenant permissions', () => {
  const buildController = (hasAccess: boolean) => {
    const tagsService = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'tag-a', space_id: 'space-a' }),
      update: jest.fn().mockResolvedValue({ id: 'tag-a', name: 'Updated' }),
      remove: jest.fn().mockResolvedValue({ id: 'tag-a' }),
      findAll: jest.fn(),
      create: jest.fn(),
    };
    const permissionsService = {
      hasAccess: jest.fn().mockResolvedValue(hasAccess),
    };

    return {
      controller: new TagsController(
        tagsService as any,
        permissionsService as any,
      ),
      tagsService,
      permissionsService,
    };
  };

  it('blocks tag updates when the user is not an editor in the tag space', async () => {
    const { controller, permissionsService, tagsService } =
      buildController(false);

    await expect(
      controller.update(
        'tag-a',
        { name: 'Updated' },
        { user: { id: 'user-a' } },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(permissionsService.hasAccess).toHaveBeenCalledWith(
      'user-a',
      'space-a',
      SpaceRole.EDITOR,
    );
    expect(tagsService.update).not.toHaveBeenCalled();
  });

  it('allows tag deletion only after checking the tag space permission', async () => {
    const { controller, permissionsService, tagsService } =
      buildController(true);

    await expect(
      controller.remove('tag-a', { user: { id: 'user-a' } }),
    ).resolves.toEqual({ id: 'tag-a' });

    expect(permissionsService.hasAccess).toHaveBeenCalledWith(
      'user-a',
      'space-a',
      SpaceRole.EDITOR,
    );
    expect(tagsService.remove).toHaveBeenCalledWith('tag-a');
  });
});
