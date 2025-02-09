import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { User, UserRole } from '../../../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: UserRole.TRAVELER,
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockRefreshTokenSecret = 'test-refresh-token-secret';

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
          useValue: mockRefreshTokenSecret,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
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

    it('should register a new user', async () => {
      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const expectedUser = { ...registerDto, password: hashedPassword, id: 1 };
      mockUserRepository.create.mockReturnValue(expectedUser);
      mockUserRepository.save.mockResolvedValue(expectedUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        id: expectedUser.id,
        firstName: expectedUser.firstName,
        lastName: expectedUser.lastName,
        email: expectedUser.email,
        role: expectedUser.role,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should authenticate user and return tokens', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const mockTokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.access_token)
        .mockResolvedValueOnce(mockTokens.refresh_token);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        ...mockTokens,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const userId = 1;
    const refreshToken = 'valid-refresh-token';

    it('should refresh tokens when valid refresh token provided', async () => {
      const hashedRefreshToken = 'hashed-refresh-token';
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        refreshToken: hashedRefreshToken,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const mockNewTokens = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockNewTokens.access_token)
        .mockResolvedValueOnce(mockNewTokens.refresh_token);

      const result = await service.refreshToken(userId, refreshToken);

      expect(result).toEqual(mockNewTokens);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(refreshToken, hashedRefreshToken);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        refreshToken: 'hashed-refresh-token',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
