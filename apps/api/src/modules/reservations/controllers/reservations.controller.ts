import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException, Patch, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ListReservationsDto } from '../dto/list-reservations.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { CancelReservationDto } from '../dto/cancel-reservation.dto';
import { ConfirmReservationDto } from '../dto/confirm-reservation.dto';
import { UpdateReservationStatusDto } from '../dto/update-reservation-status.dto';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  async findAll(
    @GetUser() user: User,
    @Query() filters: ListReservationsDto,
  ) {
    return this.reservationsService.findAll(user, filters);
  }

  @Get('hotel/:hotelId')
  @Roles('agent')
  async findByHotel(@Param('hotelId') hotelId: string) {
    return this.reservationsService.findByHotel(+hotelId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    const reservation = await this.reservationsService.findOne(+id);

    if (user.role !== 'agent' && reservation.userId !== user.id) {
      throw new ForbiddenException('You can only view your own reservations');
    }

    return reservation;
  }

  @Post()
  async create(
    @GetUser() user: User,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    createReservationDto.userId = user.id;
    return this.reservationsService.create(createReservationDto);
  }

  @Post('confirm')
  @Roles('agent')
  async confirm(
    @GetUser() user: User,
    @Body() confirmDto: ConfirmReservationDto,
  ) {
    return this.reservationsService.confirm(confirmDto, user.id);
  }

  @Post('cancel')
  async cancel(
    @GetUser() user: User,
    @Body() cancelDto: CancelReservationDto,
  ) {
    return this.reservationsService.cancel(
      cancelDto,
      user.id,
      user.role === 'agent',
    );
  }

  @Patch(':id/status')
  @Roles('agent')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReservationStatusDto,
    @GetUser() user: User,
  ) {
    return this.reservationsService.updateStatus(+id, updateStatusDto.status, user.id);
  }

  @Get('fetch/with-messages')
  async fetchWithMessages() {
    return this.reservationsService.fetchWithMessages();
  }

  @Get('fetch/validate-availability')
  @Public()
  async validateRoomAvailability(
    @Query('hotelId', ParseIntPipe) hotelId: number,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    if (!hotelId || !checkIn || !checkOut) {
      throw new BadRequestException('hotelId, checkIn and checkOut are required');
    }

    try {
      return this.reservationsService.validateRoomAvailability(
        hotelId,
        checkIn,
        checkOut
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
