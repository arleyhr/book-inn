import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { SeederService } from '../services/seeder.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('seeder')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('generate')
  @Roles('agent')
  async generateSeedData(@Query('count') count = 10) {
    return this.seederService.generateSeedData(count);
  }
}
