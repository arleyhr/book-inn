import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, UnauthorizedException, Patch } from '@nestjs/common';
import { HotelsService } from '../services/hotels.service';
import { ReviewsService } from '../services/reviews.service';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../users/entities/user.entity';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly reviewsService: ReviewsService
  ) {}

  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Public()
  @Get('search')
  async search(@Query() searchParams: SearchHotelsDto) {
    return this.hotelsService.search(searchParams);
  }

  @Public()
  @Get('featured')
  async getFeatured(@Query('limit') limit?: number) {
    return this.hotelsService.getFeatured(limit);
  }

  @Get('fetch/by-agent')
  @Roles('agent')
  getAgentHotels(@GetUser() user: User) {
    return this.hotelsService.findAgentHotels(user.id);
  }

  @Post()
  @Roles('agent')
  create(
    @GetUser() user: User,
    @Body() createHotelDto: CreateHotelDto) {
    const agentId = user.id;
    return this.hotelsService.create({ ...createHotelDto, agentId });
  }

  @Put(':hotelId/rooms/:roomId/toggle')
  @Roles('agent')
  async toggleRoomAvailability(
    @GetUser() user: User,
    @Param('hotelId') hotelId: string,
    @Param('roomId') roomId: string
  ) {
    const hotel = await this.hotelsService.findOne(+hotelId);
    if (hotel.agentId !== user.id) {
      throw new UnauthorizedException('You can only toggle rooms for your own hotels');
    }
    return this.hotelsService.toggleRoomAvailability(+hotelId, +roomId);
  }

  @Patch(':id')
  @Roles('agent')
  async update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateHotelDto: Partial<CreateHotelDto>
  ) {
    const hotel = await this.hotelsService.findOne(+id);
    if (hotel.agentId !== user.id) {
      throw new UnauthorizedException('You can only update your own hotels');
    }
    const agentId = user.id;
    return this.hotelsService.update(+id, { ...updateHotelDto, agentId });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(+id);
  }

  @Delete(':id')
  @Roles('agent')
  async remove(
    @GetUser() user: User,
    @Param('id') id: string
  ) {
    const hotel = await this.hotelsService.findOne(+id);
    if (hotel.agentId !== user.id) {
      throw new UnauthorizedException('You can only delete your own hotels');
    }
    return this.hotelsService.remove(+id);
  }

  @Post(':id/reviews')
  async createReview(
    @GetUser() user: User,
    @Param('id') hotelId: string,
    @Body() createReviewDto: { rating: number; comment: string }
  ) {
    return this.reviewsService.create({
      ...createReviewDto,
      userId: user.id,
      hotelId: +hotelId
    });
  }
}
