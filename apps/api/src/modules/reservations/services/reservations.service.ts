import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { ListReservationsDto } from '../dto/list-reservations.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { CancelReservationDto } from '../dto/cancel-reservation.dto';
import { ConfirmReservationDto } from '../dto/confirm-reservation.dto';

const CANCELLATION_DEADLINE_DAYS = 3;

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async findAll(filters: ListReservationsDto = {}): Promise<Reservation[]> {
    const query = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .leftJoinAndSelect('reservation.user', 'user');

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
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['room', 'room.hotel', 'user', 'cancelledByUser', 'confirmedByUser'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async findByHotel(hotelId: number): Promise<Reservation[]> {
    return this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .leftJoinAndSelect('reservation.user', 'user')
      .where('hotel.id = :hotelId', { hotelId })
      .getMany();
  }

  async findByAgent(agentId: number, filters: ListReservationsDto = {}): Promise<Reservation[]> {
    const query = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .leftJoinAndSelect('reservation.user', 'user')
      .where('hotel.agentId = :agentId', { agentId });

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

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const existingReservation = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.roomId = :roomId', { roomId: createReservationDto.roomId })
      .andWhere(
        '((:checkIn BETWEEN reservation.checkInDate AND reservation.checkOutDate) OR (:checkOut BETWEEN reservation.checkInDate AND reservation.checkOutDate))',
        {
          checkIn: createReservationDto.checkInDate,
          checkOut: createReservationDto.checkOutDate,
        },
      )
      .getOne();

    if (existingReservation) {
      throw new ConflictException('Room is not available for the selected dates');
    }

    const reservation = this.reservationRepository.create(createReservationDto);
    const savedReservation = await this.reservationRepository.save(reservation);

    return this.findOne(savedReservation.id);
  }

  async confirm(confirmDto: ConfirmReservationDto, agentId: number): Promise<Reservation> {
    const reservation = await this.findOne(confirmDto.reservationId);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new ConflictException('Only pending reservations can be confirmed');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.confirmedAt = new Date();
    reservation.confirmedBy = agentId;

    return this.reservationRepository.save(reservation);
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
}
