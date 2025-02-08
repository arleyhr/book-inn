import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user || !resourceId) {
      throw new ForbiddenException('Access denied');
    }

    // Check if the user is the owner of the resource
    // This is a basic implementation. You might want to customize this based on your needs
    return user.id === parseInt(resourceId);
  }
}
