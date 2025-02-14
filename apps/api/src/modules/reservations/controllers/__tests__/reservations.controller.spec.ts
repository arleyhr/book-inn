import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from '../reservations.controller';
import { ReservationsService } from '../../services/reservations.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../../../users/entities/user.entity';
import { CreateReservationDto } from '../../dto/create-reservation.dto';
import { ConfirmReservationDto } from '../../dto/confirm-reservation.dto';
import { CancelReservationDto } from '../../dto/cancel-reservation.dto';
import { ListReservationsDto } from '../../dto/list-reservations.dto';
import { ReservationStatus } from '../../entities/reservation.entity';
import { UpdateReservationStatusDto } from '../../dto/update-reservation-status.dto';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockUser: User = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password',
    role: UserRole.TRAVELER,
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn(),
    managedHotels: [],
    reviews: [],
    reservations: [],
    sentMessages: [],
    confirmedReservations: [],
    cancelledReservations: []
  };

  const mockReservation = {
    id: 1,
    checkInDate: new Date(),
    checkOutDate: new Date(),
    guestName: 'Test Guest',
    guestEmail: 'guest@test.com',
    guestPhone: '1234567890',
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: '0987654321',
    userId: mockUser.id,
    roomId: 1,
    status: ReservationStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockReservationsService = {
    findByAgent: jest.fn(),
    findByHotel: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    confirm: jest.fn(),
    cancel: jest.fn(),
    updateStatus: jest.fn(),
    validateRoomAvailability: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService
        }
      ]
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  describe('findAllForAgent', () => {
    it('should return all reservations for an agent', async () => {
      const query: ListReservationsDto = {
        startDate: new Date(),
        endDate: new Date()
      };
      const reservations = [mockReservation];
      mockReservationsService.findByAgent.mockResolvedValue(reservations);

      const result = await controller.findAllForAgent(mockUser, query);

      expect(result).toEqual(reservations);
      expect(service.findByAgent).toHaveBeenCalledWith(mockUser.id, query);
    });
  });

  describe('findByHotel', () => {
    it('should return reservations for a hotel', async () => {
      const hotelId = '1';
      const reservations = [mockReservation];
      mockReservationsService.findByHotel.mockResolvedValue(reservations);

      const result = await controller.findByHotel(hotelId);

      expect(result).toEqual(reservations);
      expect(service.findByHotel).toHaveBeenCalledWith(parseInt(hotelId));
    });
  });

  describe('findOne', () => {
    it('should return a reservation when user is owner', async () => {
      const reservationId = '1';
      mockReservationsService.findOne.mockResolvedValue(mockReservation);

      const result = await controller.findOne(reservationId, mockUser);

      expect(result).toEqual(mockReservation);
      expect(service.findOne).toHaveBeenCalledWith(parseInt(reservationId));
    });

    it('should throw ForbiddenException when user is not owner or agent', async () => {
      const reservationId = '1';
      const otherUserId = 999;
      mockReservationsService.findOne.mockResolvedValue({
        ...mockReservation,
        userId: otherUserId
      });

      await expect(controller.findOne(reservationId, mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createDto: CreateReservationDto = {
        checkInDate: '2024-03-01',
        checkOutDate: '2024-03-10',
        guestName: 'Test Guest',
        guestEmail: 'guest@test.com',
        guestPhone: '1234567890',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '0987654321',
        roomId: 1
      };
      mockReservationsService.create.mockResolvedValue(mockReservation);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual(mockReservation);
      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUser.id
      });
    });
  });

  describe('validateRoomAvailability', () => {
    it('should validate room availability', async () => {
      const hotelId = 1;
      const checkIn = '2024-03-01';
      const checkOut = '2024-03-10';
      const availability = { available: true, unavailableRooms: [] };
      mockReservationsService.validateRoomAvailability.mockResolvedValue(availability);

      const result = await controller.validateRoomAvailability(hotelId, checkIn, checkOut);

      expect(result).toEqual(availability);
      expect(service.validateRoomAvailability).toHaveBeenCalledWith(hotelId, checkIn, checkOut);
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status', async () => {
      const reservationId = '1';
      const updateStatusDto: UpdateReservationStatusDto = {
        status: ReservationStatus.CONFIRMED
      };
      const updatedReservation = {
        ...mockReservation,
        status: ReservationStatus.CONFIRMED
      };
      mockReservationsService.updateStatus.mockResolvedValue(updatedReservation);

      const result = await controller.updateStatus(reservationId, updateStatusDto, mockUser);

      expect(result).toEqual(updatedReservation);
      expect(service.updateStatus).toHaveBeenCalledWith(
        parseInt(reservationId),
        updateStatusDto.status,
        mockUser.id
      );
    });
  });
});
