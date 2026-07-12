import { Test, TestingModule } from '@nestjs/testing';
import { MOCK_PROVIDERS } from '../test-utils/mock-providers';
import { ListsService } from './lists.service';

describe('ListsService', () => {
  let service: ListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListsService, ...MOCK_PROVIDERS],
    }).compile();

    service = module.get<ListsService>(ListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
