import { Test, TestingModule } from '@nestjs/testing';
import { MOCK_PROVIDERS } from '../test-utils/mock-providers';
import { AttachmentsService } from './attachments.service';

describe('AttachmentsService', () => {
  let service: AttachmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttachmentsService, ...MOCK_PROVIDERS],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
