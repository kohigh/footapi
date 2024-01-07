import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UnprocessableEntityException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = { name: 'Vasya' };

      const createdUser = {
        id: 1,
        ...createUserDto,
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await usersController.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw UnprocessableEntityException when UsersService create method throws it', async () => {
      const createUserDto: CreateUserDto = { name: 'vasya' };

      jest.spyOn(usersService, 'create').mockRejectedValue(new UnprocessableEntityException());

      try {
        await usersController.create(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
