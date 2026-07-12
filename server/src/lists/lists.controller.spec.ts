import { Test, TestingModule } from '@nestjs/testing';
import { MOCK_PROVIDERS } from '../test-utils/mock-providers';
import { ListsController } from './lists.controller';

describe('ListsController', () => {
  let controller: ListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [...MOCK_PROVIDERS],
    }).compile();

    controller = module.get<ListsController>(ListsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
