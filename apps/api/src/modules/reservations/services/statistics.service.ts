import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';

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
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async getHotelOccupancy(hotelId: number, startDate: Date, endDate: Date): Promise<OccupancyStats> {
    const reservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere(
        '(reservation.checkInDate BETWEEN :startDate AND :endDate OR reservation.checkOutDate BETWEEN :startDate AND :endDate)',
        { startDate, endDate }
      )
      .getMany();

    const totalRooms = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .getCount();

    const upcomingReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere('reservation.checkInDate > :now', { now: new Date() })
      .getCount();

    return {
      totalRooms,
      occupiedRooms: reservations.length,
      occupancyRate: totalRooms > 0 ? (reservations.length / totalRooms) * 100 : 0,
      upcomingReservations,
    };
  }

  async getHotelRevenue(hotelId: number, startDate: Date, endDate: Date): Promise<RevenueStats> {
    const reservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED })
      .getMany();

    const periodReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere(
        '(reservation.checkInDate BETWEEN :startDate AND :endDate OR reservation.checkOutDate BETWEEN :startDate AND :endDate)',
        { startDate, endDate }
      )
      .getMany();

    const totalRevenue = reservations.reduce((sum, reservation) => sum + Number(reservation.room.basePrice), 0);
    const periodRevenue = periodReservations.reduce((sum, reservation) => sum + Number(reservation.room.basePrice), 0);
    const averageRoomRate = reservations.length > 0 ? totalRevenue / reservations.length : 0;

    return {
      totalRevenue,
      periodRevenue,
      averageRoomRate,
      reservationsCount: reservations.length,
    };
  }
}
