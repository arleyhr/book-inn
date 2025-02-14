import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from '../statistics.service';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { Room } from '../../../hotels/entities/room.entity';
import { HotelsService } from '../../../hotels/services/hotels.service';
import { ReservationsService } from '../reservations.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let reservationRepository: Repository<Reservation>;
  let roomRepository: Repository<Room>;
  let hotelsService: HotelsService;
  let reservationsService: ReservationsService;

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    getQuery: jest.fn().mockReturnValue('mock query')
  };

  const mockReservationRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder)
  };

  const mockRoomRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder)
  };

  const mockHotelsService = {
    findOne: jest.fn().mockImplementation(() => Promise.resolve({ rooms: [] }))
  };

  const mockReservationsService = {
    findByHotel: jest.fn().mockImplementation(() => Promise.resolve([]))
  };

  const testDate = {
    hotelId: 1,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31')
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository
        },
        {
          provide: HotelsService,
          useValue: mockHotelsService
        },
        {
          provide: ReservationsService,
          useValue: mockReservationsService
        }
      ]
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
    hotelsService = module.get<HotelsService>(HotelsService);
    reservationsService = module.get<ReservationsService>(ReservationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHotelOccupancy', () => {
    it('should return zero occupancy when hotel has no rooms', async () => {
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getHotelOccupancy(
        testDate.hotelId,
        testDate.startDate,
        testDate.endDate
      );

      expect(result).toEqual({
        totalRooms: 0,
        occupiedRooms: 0,
        occupancyRate: 0,
        upcomingReservations: 0
      });
    });

    it('should calculate correct occupancy rate', async () => {
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);

      const result = await service.getHotelOccupancy(
        testDate.hotelId,
        testDate.startDate,
        testDate.endDate
      );

      expect(result).toEqual({
        totalRooms: 10,
        occupiedRooms: 5,
        occupancyRate: 50,
        upcomingReservations: 3
      });

      expect(mockRoomRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockReservationRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('room.hotelId = :hotelId', { hotelId: testDate.hotelId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(reservation.checkInDate <= :endDate AND reservation.checkOutDate >= :startDate)',
        { startDate: testDate.startDate, endDate: testDate.endDate }
      );
    });

    it('should handle edge case with no occupied rooms', async () => {
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(2);

      const result = await service.getHotelOccupancy(
        testDate.hotelId,
        testDate.startDate,
        testDate.endDate
      );

      expect(result).toEqual({
        totalRooms: 5,
        occupiedRooms: 0,
        occupancyRate: 0,
        upcomingReservations: 2
      });
    });

    it('should handle edge case with full occupancy', async () => {
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0);

      const result = await service.getHotelOccupancy(
        testDate.hotelId,
        testDate.startDate,
        testDate.endDate
      );

      expect(result).toEqual({
        totalRooms: 5,
        occupiedRooms: 5,
        occupancyRate: 100,
        upcomingReservations: 0
      });
    });
  });

  describe('getHotelRevenue', () => {
    const mockReservations = {
      standard: [
        {
          id: 1,
          checkInDate: '2024-03-01',
          checkOutDate: '2024-03-05',
          room: { basePrice: 100, taxes: 20 }
        },
        {
          id: 2,
          checkInDate: '2024-03-10',
          checkOutDate: '2024-03-15',
          room: { basePrice: 150, taxes: 30 }
        }
      ],
      partialOverlap: [
        {
          id: 1,
          checkInDate: '2024-02-28',
          checkOutDate: '2024-03-05',
          room: { basePrice: 100, taxes: 20 }
        },
        {
          id: 2,
          checkInDate: '2024-03-25',
          checkOutDate: '2024-04-02',
          room: { basePrice: 150, taxes: 30 }
        }
      ],
      singleNight: [
        {
          id: 1,
          checkInDate: '2024-03-01',
          checkOutDate: '2024-03-02',
          room: { basePrice: 100, taxes: 20 }
        }
      ]
    };

    it('should calculate revenue correctly', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations.standard);

      const result = await service.getHotelRevenue(
        testDate.hotelId,
        testDate.startDate,
        testDate.endDate
      );

      expect(result).toEqual({
        totalRevenue: 1380,
        periodRevenue: 1380,
        averageRoomRate: 690,
        reservationsCount: 2
      });

      expect(mockReservationRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('room.hotelId = :hotelId', { hotelId: testDate.hotelId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('reservation.status = :status', { status: ReservationStatus.CONFIRMED });
    });

    it('should return zero revenue when no reservations exist', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getHotelRevenue(
        testDate.hotelId,
        testDate.startDate,
        testDate.endDate
      );

      expect(result).toEqual({
        totalRevenue: 0,
        periodRevenue: 0,
        averageRoomRate: 0,
        reservationsCount: 0
      });
    });

    it('should calculate period revenue correctly for partial overlaps', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations.partialOverlap);

      const result = await service.getHotelRevenue(
        testDate.hotelId,
        testDate.startDate,
        testDate.endDate
      );

      expect(result).toEqual({
        totalRevenue: 2160,
        periodRevenue: 2160,
        averageRoomRate: 1080,
        reservationsCount: 2
      });
    });

    it('should handle edge case with single-night reservations', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations.singleNight);

      const result = await service.getHotelRevenue(
        testDate.hotelId,
        testDate.startDate,
        testDate.endDate
      );

      expect(result).toEqual({
        totalRevenue: 120,
        periodRevenue: 120,
        averageRoomRate: 120,
        reservationsCount: 1
      });
    });
  });
});
