import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { HotelsService } from '../services/hotels.service';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SearchHotelsDto } from '../dto/search-hotels.dto';

@Controller('hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(+id);
  }

  @Post()
  @Roles('agent')
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelsService.create(createHotelDto);
  }

  @Put(':id')
  @Roles('agent')
  update(@Param('id') id: string, @Body() updateHotelDto: CreateHotelDto) {
    return this.hotelsService.update(+id, updateHotelDto);
  }

  @Delete(':id')
  @Roles('agent')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(+id);
  }

  @Get('search')
  async search(@Query() searchParams: SearchHotelsDto) {
    return this.hotelsService.search(searchParams);
  }
}
