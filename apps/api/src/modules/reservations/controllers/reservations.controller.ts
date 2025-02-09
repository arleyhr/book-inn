import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ListReservationsDto } from '../dto/list-reservations.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { CancelReservationDto } from '../dto/cancel-reservation.dto';
import { ConfirmReservationDto } from '../dto/confirm-reservation.dto';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @Roles('agent')
  async findAllForAgent(
    @GetUser() user: User,
    @Query() filters: ListReservationsDto,
  ) {
    return this.reservationsService.findByAgent(user.id, filters);
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
}
