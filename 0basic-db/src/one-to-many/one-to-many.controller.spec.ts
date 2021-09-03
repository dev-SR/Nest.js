import { Test, TestingModule } from '@nestjs/testing';
import { OneToManyController } from './one-to-many.controller';

describe('OneToManyController', () => {
  let controller: OneToManyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OneToManyController],
    }).compile();

    controller = module.get<OneToManyController>(OneToManyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
