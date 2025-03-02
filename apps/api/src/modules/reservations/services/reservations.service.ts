import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { ListReservationsDto } from '../dto/list-reservations.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { CancelReservationDto } from '../dto/cancel-reservation.dto';
import { ConfirmReservationDto } from '../dto/confirm-reservation.dto';
import { ReservationEmailService } from '../../email/services/reservation-email.service';
import { User } from '../../users/entities/user.entity';
import { RoomsService } from '../../hotels/services/rooms.service';

const CANCELLATION_DEADLINE_DAYS = 3;

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly roomsService: RoomsService,
    private readonly reservationEmailService: ReservationEmailService
  ) {}

  async findAll(user: User, filters: ListReservationsDto = {}): Promise<Reservation[]> {
    const query = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .leftJoinAndSelect('reservation.user', 'user')
      .orderBy('reservation.createdAt', 'DESC');

    if (filters.role === 'agent' && user.role === 'agent') {
      query.andWhere('hotel.agentId = :agentId', { agentId: user.id });
    }

    if (filters.role === 'traveler') {
      query.andWhere('reservation.userId = :userId', { userId: user.id });
    }

    if (filters.hotelId) {
      query.andWhere('hotel.id = :hotelId', { hotelId: filters.hotelId });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere(
        '(reservation.checkInDate BETWEEN :startDate AND :endDate OR reservation.checkOutDate BETWEEN :startDate AND :endDate)',
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      );
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Reservation> {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: [
        'room',
        'room.hotel',
        'room.hotel.reviews',
        'user',
        'cancelledByUser',
        'confirmedByUser'
      ],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async findByHotel(hotelId: number): Promise<Reservation[]> {
    if (!hotelId || isNaN(hotelId)) {
      throw new BadRequestException('Invalid hotel ID');
    }

    return this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .leftJoinAndSelect('reservation.user', 'user')
      .where('hotel.id = :hotelId', { hotelId })
      .orderBy('reservation.createdAt', 'DESC')
      .getMany();
  }

  async findByAgent(agentId: number, filters: ListReservationsDto = {}): Promise<Reservation[]> {
    const query = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .leftJoinAndSelect('reservation.user', 'user')
      .where('hotel.agentId = :agentId', { agentId })
      .orderBy('reservation.createdAt', 'DESC');

    if (filters.hotelId) {
      query.andWhere('hotel.id = :hotelId', { hotelId: filters.hotelId });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere(
        '(reservation.checkInDate BETWEEN :startDate AND :endDate OR reservation.checkOutDate BETWEEN :startDate AND :endDate)',
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      );
    }

    return query.getMany();
  }

  async validateRoomAvailability(hotelId: number, checkIn: string, checkOut: string): Promise<{ available: boolean; unavailableRooms: number[] }> {
    if (!hotelId || isNaN(hotelId)) {
      throw new BadRequestException('Invalid hotel ID');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-in date must be before check-out date');
    }

    const existingReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .where('hotel.id = :hotelId', { hotelId })
      .andWhere(
        '((:checkIn BETWEEN reservation.checkInDate AND reservation.checkOutDate) OR (:checkOut BETWEEN reservation.checkInDate AND reservation.checkOutDate) OR (reservation.checkInDate BETWEEN :checkIn AND :checkOut))',
        {
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
        },
      )
      .getMany();

    const unavailableRooms = existingReservations.map(r => r.roomId);
    const uniqueUnavailableRooms = [...new Set(unavailableRooms)];

    return {
      available: uniqueUnavailableRooms.length === 0,
      unavailableRooms: uniqueUnavailableRooms
    };
  }

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const room = await this.roomsService.findOne(createReservationDto.roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const existingReservations = await this.validateRoomAvailability(room.hotelId, createReservationDto.checkInDate, createReservationDto.checkOutDate);

    const roomIsUnavailable = existingReservations.unavailableRooms.includes(createReservationDto.roomId);

    if (roomIsUnavailable) {
      throw new ConflictException('Room is not available for the selected dates');
    }

    if ((room.guestCapacity - createReservationDto.guestCount) < 0) {
      throw new ConflictException('Room capacity is insufficient for the selected number of guests');
    }

    const reservation = this.reservationRepository.create(createReservationDto);
    const savedReservation = await this.reservationRepository.save(reservation);

    const completeReservation = await this.findOne(savedReservation.id);

    try {
      if (!completeReservation.room || !completeReservation.room.hotel) {
        this.logger.warn(
          `Cannot send confirmation email for reservation #${completeReservation.id}: Missing room or hotel data`
        );
        return completeReservation;
      }

      await this.reservationEmailService.sendReservationConfirmation(
        completeReservation,
        completeReservation.room,
        completeReservation.room.hotel
      );
      this.logger.log(`Reservation confirmation email sent for reservation #${completeReservation.id}`);
    } catch (error) {
      this.logger.error(
        `Error sending reservation confirmation email for reservation #${completeReservation.id}: ${error.message}`,
        error.stack
      );
    }

    return completeReservation;
  }

  async confirm(confirmDto: ConfirmReservationDto, agentId: number): Promise<Reservation> {
    const reservation = await this.findOne(confirmDto.reservationId);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new ConflictException('Only pending reservations can be confirmed');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.confirmedAt = new Date();
    reservation.confirmedBy = agentId;

    const savedReservation = await this.reservationRepository.save(reservation);

    try {
      if (!savedReservation.room || !savedReservation.room.hotel) {
        this.logger.warn(
          `Cannot send confirmation email for reservation #${savedReservation.id}: Missing room or hotel data`
        );
        return savedReservation;
      }

      await this.reservationEmailService.sendReservationConfirmation(
        savedReservation,
        savedReservation.room,
        savedReservation.room.hotel
      );
      this.logger.log(`Confirmation email sent for reservation #${savedReservation.id}`);
    } catch (error) {
      this.logger.error(
        `Error sending confirmation email for reservation #${savedReservation.id}: ${error.message}`,
        error.stack
      );
    }

    return savedReservation;
  }

  async cancel(cancelDto: CancelReservationDto, userId: number, isAgent: boolean): Promise<Reservation> {
    const reservation = await this.findOne(cancelDto.reservationId);

    if (!isAgent && reservation.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.CONFIRMED) {
      throw new ConflictException('Only pending or confirmed reservations can be cancelled');
    }

    if (!isAgent) {
      const checkInDate = new Date(reservation.checkInDate);
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + CANCELLATION_DEADLINE_DAYS);

      if (checkInDate < deadlineDate) {
        throw new ForbiddenException(`Reservations cannot be cancelled within ${CANCELLATION_DEADLINE_DAYS} days of check-in`);
      }
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancellationReason = cancelDto.reason;
    reservation.cancelledAt = new Date();
    reservation.cancelledBy = userId;

    return this.reservationRepository.save(reservation);
  }

  async updateStatus(id: number, status: ReservationStatus, agentId: number): Promise<Reservation> {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const reservation = await this.findOne(id);

    if (reservation.status === status) {
      throw new ConflictException(`Reservation is already ${status}`);
    }

    if (status === ReservationStatus.CONFIRMED) {
      if (reservation.status !== ReservationStatus.PENDING) {
        throw new ConflictException('Only pending reservations can be confirmed');
      }
      reservation.confirmedAt = new Date();
      reservation.confirmedBy = agentId;
    } else if (status === ReservationStatus.CANCELLED) {
      if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.CONFIRMED) {
        throw new ConflictException('Only pending or confirmed reservations can be cancelled');
      }
      reservation.cancelledAt = new Date();
      reservation.cancelledBy = agentId;
    }

    reservation.status = status;
    const savedReservation = await this.reservationRepository.save(reservation);

    if (status === ReservationStatus.CONFIRMED) {
      try {
        if (!savedReservation.room || !savedReservation.room.hotel) {
          this.logger.warn(
            `Cannot send confirmation email for reservation #${savedReservation.id}: Missing room or hotel data`
          );
          return savedReservation;
        }

        await this.reservationEmailService.sendReservationConfirmation(
          savedReservation,
          savedReservation.room,
          savedReservation.room.hotel
        );
        this.logger.log(`Confirmation email sent for reservation #${savedReservation.id}`);
      } catch (error) {
        this.logger.error(
          `Error sending confirmation email for reservation #${savedReservation.id}: ${error.message}`,
          error.stack
        );
      }
    }

    return savedReservation;
  }

  fetchWithMessages() {
    return this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.messages', 'messages')
      .where('messages.id IS NOT NULL')
      .orderBy('reservation.createdAt', 'DESC')
      .getMany();
  }
}
