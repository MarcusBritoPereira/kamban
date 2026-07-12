import { Test, TestingModule } from '@nestjs/testing';
import { MOCK_PROVIDERS } from '../test-utils/mock-providers';
import { SpacesService } from './spaces.service';

describe('SpacesService', () => {
  let service: SpacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpacesService, ...MOCK_PROVIDERS],
    }).compile();

    service = module.get<SpacesService>(SpacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
