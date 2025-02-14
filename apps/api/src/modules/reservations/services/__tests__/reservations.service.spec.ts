import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationsService } from '../reservations.service';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { CreateReservationDto } from '../../dto/create-reservation.dto';
import { CancelReservationDto } from '../../dto/cancel-reservation.dto';
import { ConfirmReservationDto } from '../../dto/confirm-reservation.dto';
import { ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ListReservationsDto } from '../../dto/list-reservations.dto';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: Repository<Reservation>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getCount: jest.fn()
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder)
  };

  const testData = {
    dates: {
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      checkIn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in the future
      checkOut: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days in the future
    },
    ids: {
      userId: 1,
      hotelId: 1,
      roomId: 1,
      reservationId: 1
    },
    guest: {
      name: 'Test Guest',
      email: 'guest@test.com',
      phone: '1234567890',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '0987654321'
    }
  };

  const mockReservation = {
    id: testData.ids.reservationId,
    checkInDate: testData.dates.checkIn,
    checkOutDate: testData.dates.checkOut,
    guestName: testData.guest.name,
    guestEmail: testData.guest.email,
    guestPhone: testData.guest.phone,
    emergencyContactName: testData.guest.emergencyContactName,
    emergencyContactPhone: testData.guest.emergencyContactPhone,
    userId: testData.ids.userId,
    roomId: testData.ids.roomId,
    status: ReservationStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    room: { hotel: {} },
    user: {},
    cancelledByUser: null,
    confirmedByUser: null
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    repository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      const mockReservations = [{ id: 1 }, { id: 2 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations);

      const result = await service.findAll();

      expect(result).toEqual(mockReservations);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by hotel id when provided', async () => {
      const mockReservations = [{ id: 1 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations);

      const result = await service.findAll({ hotelId: testData.ids.hotelId });

      expect(result).toEqual(mockReservations);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('hotel.id = :hotelId', { hotelId: testData.ids.hotelId });
    });

    it('should filter by date range when provided', async () => {
      const mockReservations = [{ id: 1 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations);

      const result = await service.findAll({
        startDate: testData.dates.startDate,
        endDate: testData.dates.endDate
      });

      expect(result).toEqual(mockReservations);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(reservation.checkInDate BETWEEN :startDate AND :endDate OR reservation.checkOutDate BETWEEN :startDate AND :endDate)',
        {
          startDate: testData.dates.startDate,
          endDate: testData.dates.endDate
        }
      );
    });

    it('should find all reservations with date filters', async () => {
      const listDto: ListReservationsDto = {
        startDate: testData.dates.startDate,
        endDate: testData.dates.endDate
      };
      mockQueryBuilder.getMany.mockResolvedValue([mockReservation]);

      const result = await service.findAll(listDto);

      expect(result).toEqual([mockReservation]);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(reservation.checkInDate BETWEEN :startDate AND :endDate OR reservation.checkOutDate BETWEEN :startDate AND :endDate)',
        {
          startDate: listDto.startDate,
          endDate: listDto.endDate
        }
      );
    });
  });

  describe('findOne', () => {
    it('should return a reservation if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne(testData.ids.reservationId);
      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(testData.ids.reservationId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne(NaN)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByHotel', () => {
    it('should return reservations for a hotel', async () => {
      const mockReservations = [{ id: 1 }, { id: 2 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations);

      const result = await service.findByHotel(testData.ids.hotelId);

      expect(result).toEqual(mockReservations);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('hotel.id = :hotelId', { hotelId: testData.ids.hotelId });
    });

    it('should throw BadRequestException for invalid hotel id', async () => {
      await expect(service.findByHotel(NaN)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByAgent', () => {
    it('should return reservations for an agent', async () => {
      const mockReservations = [{ id: 1 }, { id: 2 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations);

      const result = await service.findByAgent(testData.ids.userId);

      expect(result).toEqual(mockReservations);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('hotel.agentId = :agentId', { agentId: testData.ids.userId });
    });

    it('should filter by hotel id when provided', async () => {
      const mockReservations = [{ id: 1 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations);

      const result = await service.findByAgent(testData.ids.userId, { hotelId: testData.ids.hotelId });

      expect(result).toEqual(mockReservations);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('hotel.id = :hotelId', { hotelId: testData.ids.hotelId });
    });

    it('should filter by date range when provided', async () => {
      const mockReservations = [{ id: 1 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations);

      const result = await service.findByAgent(testData.ids.userId, {
        startDate: testData.dates.startDate,
        endDate: testData.dates.endDate
      });

      expect(result).toEqual(mockReservations);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(reservation.checkInDate BETWEEN :startDate AND :endDate OR reservation.checkOutDate BETWEEN :startDate AND :endDate)',
        {
          startDate: testData.dates.startDate,
          endDate: testData.dates.endDate
        }
      );
    });

    it('should find reservations by agent with date filters', async () => {
      const listDto: ListReservationsDto = {
        startDate: testData.dates.startDate,
        endDate: testData.dates.endDate
      };
      mockQueryBuilder.getMany.mockResolvedValue([mockReservation]);

      const result = await service.findByAgent(testData.ids.userId, listDto);

      expect(result).toEqual([mockReservation]);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('hotel.agentId = :agentId', { agentId: testData.ids.userId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(reservation.checkInDate BETWEEN :startDate AND :endDate OR reservation.checkOutDate BETWEEN :startDate AND :endDate)',
        {
          startDate: listDto.startDate,
          endDate: listDto.endDate
        }
      );
    });
  });

  describe('validateRoomAvailability', () => {
    it('should return available status when no conflicting reservations', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.validateRoomAvailability(
        testData.ids.hotelId,
        testData.dates.checkIn.toISOString(),
        testData.dates.checkOut.toISOString()
      );

      expect(result).toEqual({
        available: true,
        unavailableRooms: []
      });
    });

    it('should return unavailable status with room ids when conflicts exist', async () => {
      const mockReservations = [
        { roomId: 1 },
        { roomId: 2 },
        { roomId: 1 }
      ];
      mockQueryBuilder.getMany.mockResolvedValue(mockReservations);

      const result = await service.validateRoomAvailability(
        testData.ids.hotelId,
        testData.dates.checkIn.toISOString(),
        testData.dates.checkOut.toISOString()
      );

      expect(result).toEqual({
        available: false,
        unavailableRooms: [1, 2]
      });
    });

    it('should throw BadRequestException for invalid dates', async () => {
      await expect(service.validateRoomAvailability(
        testData.ids.hotelId,
        'invalid',
        testData.dates.checkOut.toISOString()
      )).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when check-in is after check-out', async () => {
      await expect(service.validateRoomAvailability(
        testData.ids.hotelId,
        testData.dates.checkOut.toISOString(),
        testData.dates.checkIn.toISOString()
      )).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    const createDto: CreateReservationDto = {
      roomId: testData.ids.roomId,
      userId: testData.ids.userId,
      checkInDate: testData.dates.checkIn.toISOString(),
      checkOutDate: testData.dates.checkOut.toISOString(),
      guestName: testData.guest.name,
      guestEmail: testData.guest.email,
      guestPhone: testData.guest.phone,
      emergencyContactName: testData.guest.emergencyContactName,
      emergencyContactPhone: testData.guest.emergencyContactPhone
    };

    it('should create a reservation when room is available', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const mockCreatedReservation = { id: 1, ...createDto };
      mockRepository.create.mockReturnValue(mockCreatedReservation);
      mockRepository.save.mockResolvedValue(mockCreatedReservation);
      mockRepository.findOne.mockResolvedValue(mockCreatedReservation);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedReservation);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedReservation);
    });

    it('should throw ConflictException when room is not available', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({ id: 2 });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('confirm', () => {
    const confirmDto: ConfirmReservationDto = {
      reservationId: testData.ids.reservationId
    };

    it('should confirm a pending reservation', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockReservation });
      mockRepository.save.mockImplementation(reservation => reservation);

      const result = await service.confirm(confirmDto, testData.ids.userId);

      expect(result.status).toBe(ReservationStatus.CONFIRMED);
      expect(result.confirmedBy).toBe(testData.ids.userId);
      expect(result.confirmedAt).toBeInstanceOf(Date);
    });

    it('should throw ConflictException when reservation is not pending', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED
      });

      await expect(service.confirm(confirmDto, testData.ids.userId)).rejects.toThrow(ConflictException);
    });
  });

  describe('cancel', () => {
    const cancelDto: CancelReservationDto = {
      reservationId: testData.ids.reservationId,
      reason: 'Test reason'
    };

    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue({ ...mockReservation });
      mockRepository.save.mockImplementation(reservation => reservation);
    });

    it('should allow user to cancel their own reservation', async () => {
      const result = await service.cancel(cancelDto, testData.ids.userId, false);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(result.cancellationReason).toBe('Test reason');
      expect(result.cancelledBy).toBe(testData.ids.userId);
      expect(result.cancelledAt).toBeInstanceOf(Date);
    });

    it('should not allow user to cancel other users reservation', async () => {
      await expect(service.cancel(cancelDto, 999, false)).rejects.toThrow(ForbiddenException);
    });

    it('should allow agent to cancel any reservation', async () => {
      const result = await service.cancel(cancelDto, 999, true);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(result.cancelledBy).toBe(999);
    });

    it('should not allow cancellation of already cancelled reservation', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED
      });

      await expect(service.cancel(cancelDto, testData.ids.userId, false)).rejects.toThrow(ConflictException);
    });

    it('should not allow user cancellation within 3 days of check-in', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await expect(service.cancel(cancelDto, testData.ids.userId, false)).rejects.toThrow(ForbiddenException);
    });

    it('should allow agent cancellation within 3 days of check-in', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const result = await service.cancel(cancelDto, 999, true);
      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });
  });

  describe('updateStatus', () => {
    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue({ ...mockReservation });
      mockRepository.save.mockImplementation(reservation => reservation);
    });

    it('should update status to confirmed', async () => {
      const result = await service.updateStatus(testData.ids.reservationId, ReservationStatus.CONFIRMED, testData.ids.userId);

      expect(result.status).toBe(ReservationStatus.CONFIRMED);
      expect(result.confirmedBy).toBe(testData.ids.userId);
      expect(result.confirmedAt).toBeInstanceOf(Date);
    });

    it('should update status to cancelled', async () => {
      const result = await service.updateStatus(testData.ids.reservationId, ReservationStatus.CANCELLED, testData.ids.userId);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(result.cancelledBy).toBe(testData.ids.userId);
      expect(result.cancelledAt).toBeInstanceOf(Date);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.updateStatus(NaN, ReservationStatus.CONFIRMED, testData.ids.userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when status is already set', async () => {
      await expect(service.updateStatus(testData.ids.reservationId, ReservationStatus.PENDING, testData.ids.userId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when trying to confirm non-pending reservation', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED
      });

      await expect(service.updateStatus(testData.ids.reservationId, ReservationStatus.CONFIRMED, testData.ids.userId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when trying to cancel completed reservation', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.COMPLETED
      });

      await expect(service.updateStatus(testData.ids.reservationId, ReservationStatus.CANCELLED, testData.ids.userId)).rejects.toThrow(ConflictException);
    });
  });
});
