import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UnprocessableEntityException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepositoryMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    userRepositoryMock = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should create a user', async () => {
    const createUserDto = { name: 'Vasya' };

    const createdUser = {
      id: 1,
      ...createUserDto,
    };

    userRepositoryMock.save.mockResolvedValue(createdUser);

    const result = await usersService.create(createUserDto);

    expect(result).toEqual(createdUser);
    expect(userRepositoryMock.save).toHaveBeenCalledWith(createUserDto);
  });

  it('should throw UnprocessableEntityException on save error', async () => {
    const createUserDto = { name: 'Vasya' };
    const saveError = new Error('Save error');

    jest.spyOn(userRepositoryMock, 'save').mockResolvedValue(saveError)

    try {
      await usersService.create(createUserDto);
    } catch (error) {
      expect(error).toBeInstanceOf(UnprocessableEntityException);
    }

    expect(userRepositoryMock.save).toHaveBeenCalledWith(createUserDto);
  });
});
