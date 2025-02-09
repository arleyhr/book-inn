import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../../services/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      const expectedResult = {
        id: 1,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        role: registerDto.role,
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login user and return tokens', async () => {
      const expectedResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 1,
          email: loginDto.email,
          role: UserRole.TRAVELER,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = {
      userId: 1,
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh tokens with valid refresh token', async () => {
      const expectedResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(expectedResult);
      expect(service.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.userId,
        refreshTokenDto.refreshToken,
      );
    });

    it('should throw UnauthorizedException when userId is missing', async () => {
      const invalidDto = {
        refreshToken: 'valid-refresh-token',
      };

      try {
        await controller.refreshToken(invalidDto as any);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid refresh token request');
        expect(service.refreshToken).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when refreshToken is missing', async () => {
      const invalidDto = {
        userId: 1,
      };

      try {
        await controller.refreshToken(invalidDto as any);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid refresh token request');
        expect(service.refreshToken).not.toHaveBeenCalled();
      }
    });
  });
});
