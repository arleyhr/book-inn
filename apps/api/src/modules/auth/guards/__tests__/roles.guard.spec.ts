import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockExecutionContext: ExecutionContext;
  let mockReflector: Reflector;

  beforeEach(() => {
    mockReflector = new Reflector();
    guard = new RolesGuard(mockReflector);
  });

  it('should allow access when no roles are required', () => {
    mockReflector.get = jest.fn().mockReturnValue(undefined);
    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({})
      })
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const mockRequest = {
      user: { role: 'agent' }
    };

    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ExecutionContext;

    mockReflector.get = jest.fn().mockReturnValue(['agent']);

    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const mockRequest = {
      user: { role: 'traveler' }
    };

    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ExecutionContext;

    mockReflector.get = jest.fn().mockReturnValue(['agent']);

    expect(guard.canActivate(mockExecutionContext)).toBe(false);
  });

  it('should deny access when user is not present', () => {
    const mockRequest = {
      user: undefined
    };

    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ExecutionContext;

    mockReflector.get = jest.fn().mockReturnValue(['agent']);

    expect(guard.canActivate(mockExecutionContext)).toBe(false);
  });

  it('should allow access when user has one of multiple required roles', () => {
    const mockRequest = {
      user: { role: 'agent' }
    };

    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ExecutionContext;

    mockReflector.get = jest.fn().mockReturnValue(['admin', 'agent']);

    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });
});
