import { Controller, Get, Query, UseGuards, ParseIntPipe, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { StatisticsService } from '../services/statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('agent')
export class StatisticsController {
  private readonly logger = new Logger(StatisticsController.name);

  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('occupancy')
  async getOccupancy(
    @Query('hotelId', ParseIntPipe) hotelId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    this.logger.debug(`Getting occupancy stats for hotel ${hotelId} from ${startDate} to ${endDate}`);

    return this.statisticsService.getHotelOccupancy(
      hotelId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('revenue')
  async getRevenue(
    @Query('hotelId', ParseIntPipe) hotelId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    this.logger.debug(`Getting revenue stats for hotel ${hotelId} from ${startDate} to ${endDate}`);

    return this.statisticsService.getHotelRevenue(
      hotelId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
