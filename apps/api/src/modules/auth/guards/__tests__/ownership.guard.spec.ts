import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OwnershipGuard } from '../ownership.guard';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let mockExecutionContext: ExecutionContext;
  let mockReflector: Reflector;

  beforeEach(() => {
    mockReflector = new Reflector();
    guard = new OwnershipGuard(mockReflector);
  });

  it('should allow access when user id matches resource id', () => {
    const mockRequest = {
      user: { id: 1 },
      params: { id: '1' }
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('should deny access when user id does not match resource id', () => {
    const mockRequest = {
      user: { id: 1 },
      params: { id: '2' }
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockExecutionContext)).toBe(false);
  });

  it('should throw ForbiddenException when user is not present', () => {
    const mockRequest = {
      user: undefined,
      params: { id: '1' }
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when resource id is not present', () => {
    const mockRequest = {
      user: { id: 1 },
      params: {}
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
  });
});
