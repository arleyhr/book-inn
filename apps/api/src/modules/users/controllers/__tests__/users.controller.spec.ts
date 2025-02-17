import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../../services/users.service';
import { User, UserRole } from '../../entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

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

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return an empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockUsersService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid id format', async () => {
      await expect(controller.findOne('invalid-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      firstName: 'John Updated',
      lastName: 'Doe Updated',
      email: 'john.updated@example.com',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(controller.update('999', updateUserDto)).rejects.toThrow(NotFoundException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid id format', async () => {
      await expect(controller.update('invalid-id', updateUserDto)).rejects.toThrow(BadRequestException);
      expect(service.findOne).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        email: 'invalid-email',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.update.mockRejectedValue(new BadRequestException('Invalid email format'));

      await expect(controller.update('1', invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(service.remove).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid id format', async () => {
      await expect(controller.remove('invalid-id')).rejects.toThrow(BadRequestException);
      expect(service.findOne).not.toHaveBeenCalled();
    });
  });
});
