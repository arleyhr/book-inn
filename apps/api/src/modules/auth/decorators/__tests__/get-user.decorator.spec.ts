import { ExecutionContext } from '@nestjs/common';

describe('GetUser Decorator', () => {
  it('should extract user from request', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser })
      })
    } as ExecutionContext;


    jest.mock('../get-user.decorator', () => ({
      GetUser: (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      }
    }));

    const { GetUser } = require('../get-user.decorator');

    const result = GetUser(undefined, mockContext);


    expect(result).toBe(mockUser);
  });

  it('should return undefined if no user in request', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: undefined })
      })
    } as ExecutionContext;

    jest.mock('../get-user.decorator', () => ({
      GetUser: (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      }
    }));

    const { GetUser } = require('../get-user.decorator');

    const result = GetUser(undefined, mockContext);

    expect(result).toBeUndefined();
  });
});
