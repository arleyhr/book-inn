import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { OwnershipGuard } from '../../auth/guards/ownership.guard';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(OwnershipGuard)
  async findOne(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  async update(@Param('id') id: string, @Body() updateUser: Partial<User>) {
    if (isNaN(+id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.update(+id, updateUser);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  async remove(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.remove(+id);
  }
}
