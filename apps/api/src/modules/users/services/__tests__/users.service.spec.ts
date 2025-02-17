import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users.service';
import { User, UserRole } from '../../entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: UserRole.TRAVELER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockUsersRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUsersRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return null if email not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'notfound@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'hashedPassword',
        role: UserRole.TRAVELER,
      };

      const newUser = { ...createUserDto, id: 2 };
      mockUsersRepository.create.mockReturnValue(newUser);
      mockUsersRepository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(newUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(newUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        firstName: 'John Updated',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersRepository.update.mockResolvedValue({ affected: 1 });
      mockUsersRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockUsersRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
