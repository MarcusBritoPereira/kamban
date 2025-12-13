import { SetMetadata } from '@nestjs/common';

export const SpaceRole = (role: 'VIEWER' | 'EDITOR' | 'ADMIN') => SetMetadata('spaceRole', role);
