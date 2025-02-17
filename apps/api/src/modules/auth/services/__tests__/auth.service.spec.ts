import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { User, UserRole } from '../../../users/entities/user.entity';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.TRAVELER,
    isActive: true,
    refreshToken: 'hashedRefreshToken',
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn((password: string) => Promise.resolve(true)) as jest.Mock<Promise<boolean>, [string]>,
    managedHotels: [],
    reviews: [],
    reservations: [],
    sentMessages: [],
    confirmedReservations: [],
    cancelledReservations: []
  } as User;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'JWT_REFRESH_TOKEN_SECRET',
          useValue: 'test-refresh-token-secret',
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockImplementation(() => Promise.resolve('hashedPassword'));
    (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(true));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: UserRole.TRAVELER,
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const createdUser = {
        id: 1,
        ...registerDto,
        password: 'hashedPassword',
      };
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      const { password, ...expectedResult } = createdUser;
      expect(result).toEqual(expectedResult);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword',
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockTokens = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    };

    beforeEach(() => {
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.access_token)
        .mockResolvedValueOnce(mockTokens.refresh_token);
      (bcrypt.hash as jest.Mock).mockImplementation(() => Promise.resolve('hashedRefreshToken'));
      (mockUser.comparePassword as jest.Mock).mockReset();
    });

    it('should authenticate user and return tokens', async () => {
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const userId = 1;
    const refreshToken = 'valid-refresh-token';
    const mockTokens = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    };

    beforeEach(() => {
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.access_token)
        .mockResolvedValueOnce(mockTokens.refresh_token);
      (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(true));
      (bcrypt.hash as jest.Mock).mockImplementation(() => Promise.resolve('hashedRefreshToken'));
    });

    it('should refresh tokens successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.refreshToken(userId, refreshToken);

      expect(result).toEqual(mockTokens);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        { refreshToken: 'hashedRefreshToken' },
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(false));
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getCurrentUser(999)).rejects.toThrow(NotFoundException);
    });
  });
});
