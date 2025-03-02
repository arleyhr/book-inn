import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Room } from '../../hotels/entities/room.entity';
import { differenceInDays } from 'date-fns';

export interface OccupancyStats {
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  upcomingReservations: number;
}

export interface RevenueStats {
  totalRevenue: number;
  periodRevenue: number;
  averageRoomRate: number;
  reservationsCount: number;
}

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async getHotelOccupancy(hotelId: number, startDate: Date, endDate: Date): Promise<OccupancyStats> {
    this.logger.debug(`Getting occupancy stats for hotel ${hotelId}`);

    const totalRooms = await this.roomRepository
      .createQueryBuilder('room')
      .where('room.hotelId = :hotelId', { hotelId })
      .getCount();

    this.logger.debug(`Total rooms: ${totalRooms}`);

    const occupiedRoomsQuery = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere(
        '(reservation.checkInDate <= :endDate AND reservation.checkOutDate >= :startDate)',
        { startDate, endDate }
      );

    this.logger.debug('Occupied rooms query:', occupiedRoomsQuery.getQuery());
    const occupiedRooms = await occupiedRoomsQuery.getCount();
    this.logger.debug(`Occupied rooms: ${occupiedRooms}`);

    const upcomingReservationsQuery = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere('reservation.checkInDate > :now', { now: new Date() });

    this.logger.debug('Upcoming reservations query:', upcomingReservationsQuery.getQuery());
    const upcomingReservations = await upcomingReservationsQuery.getCount();
    this.logger.debug(`Upcoming reservations: ${upcomingReservations}`);

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    this.logger.debug(`Occupancy rate: ${occupancyRate}%`);

    return {
      totalRooms,
      occupiedRooms,
      occupancyRate,
      upcomingReservations,
    };
  }

  async getHotelRevenue(hotelId: number, startDate: Date, endDate: Date): Promise<RevenueStats> {
    this.logger.debug(`Getting revenue stats for hotel ${hotelId}`);

    const reservationsQuery = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED });

    this.logger.debug('Reservations query:', reservationsQuery.getQuery());
    const reservations = await reservationsQuery.getMany();
    this.logger.debug(`Total reservations found: ${reservations.length}`);

    const periodReservations = reservations.filter(reservation => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      return checkIn <= endDate && checkOut >= startDate;
    });

    this.logger.debug(`Period reservations found: ${periodReservations.length}`);

    const calculateReservationRevenue = (reservation: Reservation) => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      const nights = Math.max(1, differenceInDays(checkOut, checkIn));
      const basePrice = Number(reservation.room.basePrice);
      const taxPercentage = Number(reservation.room.taxes);
      const taxAmount = basePrice * (taxPercentage / 100);
      const total = (basePrice + taxAmount) * nights;

      this.logger.debug(`Reservation ${reservation.id} revenue calculation:`, {
        nights,
        basePrice,
        taxPercentage,
        taxAmount,
        total
      });

      return total;
    };

    const totalRevenue = reservations.reduce(
      (sum, reservation) => sum + calculateReservationRevenue(reservation),
      0
    );

    const periodRevenue = periodReservations.reduce(
      (sum, reservation) => sum + calculateReservationRevenue(reservation),
      0
    );

    const averageRoomRate = reservations.length > 0
      ? totalRevenue / reservations.length
      : 0;

    this.logger.debug('Revenue calculations:', {
      totalRevenue,
      periodRevenue,
      averageRoomRate,
      reservationsCount: reservations.length
    });

    return {
      totalRevenue,
      periodRevenue,
      averageRoomRate,
      reservationsCount: reservations.length,
    };
  }
}
