import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from '../statistics.service';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let repository: Repository<Reservation>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  const mockReservationRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    repository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));

    mockQueryBuilder.getMany.mockReset();
    mockQueryBuilder.getCount.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHotelOccupancy', () => {
    it('should return occupancy stats with zero values when no reservations exist', async () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-28');
      const hotelId = 1;

      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getHotelOccupancy(hotelId, startDate, endDate);

      expect(result).toEqual({
        totalRooms: 0,
        occupiedRooms: 0,
        occupancyRate: 0,
        upcomingReservations: 0,
      });
    });

    it('should calculate correct occupancy rate when reservations exist', async () => {
      const mockReservations = [
        {
          id: 1,
          room: { id: 1, hotelId: 1, basePrice: 100 },
          status: ReservationStatus.CONFIRMED,
          checkInDate: new Date('2024-02-15'),
          checkOutDate: new Date('2024-02-20'),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValueOnce(mockReservations);
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      const result = await service.getHotelOccupancy(1, new Date('2024-02-01'), new Date('2024-02-28'));

      expect(result).toEqual({
        totalRooms: 2,
        occupiedRooms: 1,
        occupancyRate: 50,
        upcomingReservations: 1,
      });

      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalledTimes(2);
    });
  });

  describe('getHotelRevenue', () => {
    it('should return revenue stats with zero values when no reservations exist', async () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-28');
      const hotelId = 1;

      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getHotelRevenue(hotelId, startDate, endDate);

      expect(result).toEqual({
        totalRevenue: 0,
        periodRevenue: 0,
        averageRoomRate: 0,
        reservationsCount: 0,
      });
    });

    it('should calculate correct revenue stats when reservations exist', async () => {
      const mockReservations = [
        {
          id: 1,
          room: { id: 1, hotelId: 1, basePrice: 100 },
          status: ReservationStatus.CONFIRMED,
          checkInDate: new Date('2024-02-15'),
          checkOutDate: new Date('2024-02-20'),
        },
        {
          id: 2,
          room: { id: 2, hotelId: 1, basePrice: 200 },
          status: ReservationStatus.CONFIRMED,
          checkInDate: new Date('2024-02-10'),
          checkOutDate: new Date('2024-02-12'),
        },
      ];

      mockQueryBuilder.getMany
        .mockResolvedValueOnce(mockReservations)
        .mockResolvedValueOnce(mockReservations);

      const result = await service.getHotelRevenue(1, new Date('2024-02-01'), new Date('2024-02-28'));

      expect(result).toEqual({
        totalRevenue: 300,
        periodRevenue: 300,
        averageRoomRate: 150,
        reservationsCount: 2,
      });

      expect(mockQueryBuilder.getMany).toHaveBeenCalledTimes(2);
    });
  });
});
