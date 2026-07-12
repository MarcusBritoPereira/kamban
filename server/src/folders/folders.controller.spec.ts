import { Test, TestingModule } from '@nestjs/testing';
import { MOCK_PROVIDERS } from '../test-utils/mock-providers';
import { FoldersController } from './folders.controller';

describe('FoldersController', () => {
  let controller: FoldersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoldersController],
      providers: [...MOCK_PROVIDERS],
    }).compile();

    controller = module.get<FoldersController>(FoldersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
