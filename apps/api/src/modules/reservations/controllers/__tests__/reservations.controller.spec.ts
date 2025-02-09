import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from '../reservations.controller';
import { ReservationsService } from '../../services/reservations.service';
import { ForbiddenException } from '@nestjs/common';
import { User } from '../../../users/entities/user.entity';
import { CreateReservationDto } from '../../dto/create-reservation.dto';
import { ConfirmReservationDto } from '../../dto/confirm-reservation.dto';
import { CancelReservationDto } from '../../dto/cancel-reservation.dto';
import { ListReservationsDto } from '../../dto/list-reservations.dto';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {
    findByAgent: jest.fn(),
    findByHotel: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    confirm: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllForAgent', () => {
    it('should return all reservations for an agent', async () => {
      const mockUser = {
        id: 1,
        role: 'agent',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      const mockFilters: ListReservationsDto = { hotelId: 1 };
      const mockReservations = [{ id: 1, userId: 2 }];

      mockReservationsService.findByAgent.mockResolvedValue(mockReservations);

      const result = await controller.findAllForAgent(mockUser, mockFilters);

      expect(result).toEqual(mockReservations);
      expect(service.findByAgent).toHaveBeenCalledWith(mockUser.id, mockFilters);
    });
  });

  describe('findByHotel', () => {
    it('should return reservations for a specific hotel', async () => {
      const hotelId = '1';
      const mockReservations = [{ id: 1, hotelId: 1 }];

      mockReservationsService.findByHotel.mockResolvedValue(mockReservations);

      const result = await controller.findByHotel(hotelId);

      expect(result).toEqual(mockReservations);
      expect(service.findByHotel).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    const mockReservation = { id: 1, userId: 1 };

    it('should return a reservation for its owner', async () => {
      const mockUser = {
        id: 1,
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      mockReservationsService.findOne.mockResolvedValue(mockReservation);

      const result = await controller.findOne('1', mockUser);

      expect(result).toEqual(mockReservation);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return a reservation for an agent', async () => {
      const mockUser = {
        id: 2,
        role: 'agent',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      mockReservationsService.findOne.mockResolvedValue(mockReservation);

      const result = await controller.findOne('1', mockUser);

      expect(result).toEqual(mockReservation);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      const mockUser = {
        id: 2,
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      mockReservationsService.findOne.mockResolvedValue(mockReservation);

      await expect(controller.findOne('1', mockUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      const createDto: CreateReservationDto = {
        roomId: 1,
        checkInDate: '2024-02-15',
        checkOutDate: '2024-02-20',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+1234567890',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1987654321',
        userId: mockUser.id,
      };

      const expectedReservation = { ...createDto, id: 1 };

      mockReservationsService.create.mockResolvedValue(expectedReservation);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual(expectedReservation);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('confirm', () => {
    it('should confirm a reservation', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      const confirmDto: ConfirmReservationDto = { reservationId: 1 };
      const expectedReservation = { id: 1, status: 'CONFIRMED' };

      mockReservationsService.confirm.mockResolvedValue(expectedReservation);

      const result = await controller.confirm(mockUser, confirmDto);

      expect(result).toEqual(expectedReservation);
      expect(service.confirm).toHaveBeenCalledWith(confirmDto, mockUser.id);
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation as a user', async () => {
      const mockUser = {
        id: 1,
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      const cancelDto: CancelReservationDto = {
        reservationId: 1,
        reason: 'Change of plans',
      };
      const expectedReservation = { id: 1, status: 'CANCELLED' };

      mockReservationsService.cancel.mockResolvedValue(expectedReservation);

      const result = await controller.cancel(mockUser, cancelDto);

      expect(result).toEqual(expectedReservation);
      expect(service.cancel).toHaveBeenCalledWith(cancelDto, mockUser.id, false);
    });

    it('should cancel a reservation as an agent', async () => {
      const mockUser = {
        id: 1,
        role: 'agent',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      const cancelDto: CancelReservationDto = {
        reservationId: 1,
        reason: 'Hotel maintenance required',
      };
      const expectedReservation = { id: 1, status: 'CANCELLED' };

      mockReservationsService.cancel.mockResolvedValue(expectedReservation);

      const result = await controller.cancel(mockUser, cancelDto);

      expect(result).toEqual(expectedReservation);
      expect(service.cancel).toHaveBeenCalledWith(cancelDto, mockUser.id, true);
    });
  });
});
