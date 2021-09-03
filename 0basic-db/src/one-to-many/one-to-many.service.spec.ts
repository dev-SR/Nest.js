import { Test, TestingModule } from '@nestjs/testing';
import { OneToManyService } from './one-to-many.service';

describe('OneToManyService', () => {
  let service: OneToManyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OneToManyService],
    }).compile();

    service = module.get<OneToManyService>(OneToManyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
