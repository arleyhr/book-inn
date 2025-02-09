import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationsService } from '../reservations.service';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { CreateReservationDto } from '../../dto/create-reservation.dto';
import { CancelReservationDto } from '../../dto/cancel-reservation.dto';
import { ConfirmReservationDto } from '../../dto/confirm-reservation.dto';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: Repository<Reservation>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
    }))
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
  });

  describe('findOne', () => {
    it('should return a reservation if found', async () => {
      const mockReservation = { id: 1 };
      mockRepository.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne(1);
      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByHotel', () => {
    it('should return reservations for a hotel', async () => {
      const mockReservations = [{ id: 1 }, { id: 2 }];
      mockRepository.createQueryBuilder().getMany.mockResolvedValue(mockReservations);

      const result = await service.findByHotel(1);
      expect(result).toEqual(mockReservations);
    });
  });

  describe('cancel', () => {
    const mockReservation = {
      id: 1,
      userId: 1,
      status: ReservationStatus.PENDING,
      checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue({ ...mockReservation });
      mockRepository.save.mockImplementation(reservation => reservation);
    });

    it('should allow user to cancel their own reservation', async () => {
      const cancelDto: CancelReservationDto = {
        reservationId: 1,
        reason: 'Test reason'
      };

      const result = await service.cancel(cancelDto, 1, false);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(result.cancellationReason).toBe('Test reason');
      expect(result.cancelledBy).toBe(1);
    });

    it('should not allow user to cancel other users reservation', async () => {
      const cancelDto: CancelReservationDto = {
        reservationId: 1,
        reason: 'Test reason'
      };

      await expect(service.cancel(cancelDto, 2, false)).rejects.toThrow(ForbiddenException);
    });

    it('should allow agent to cancel any reservation', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.PENDING
      });

      const cancelDto: CancelReservationDto = {
        reservationId: 1,
        reason: 'Test reason'
      };

      const result = await service.cancel(cancelDto, 2, true);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(result.cancelledBy).toBe(2);
    });

    it('should not allow cancellation of already cancelled reservation', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED
      });

      const cancelDto: CancelReservationDto = {
        reservationId: 1,
        reason: 'Test reason'
      };

      await expect(service.cancel(cancelDto, 1, false)).rejects.toThrow(ConflictException);
    });

    it('should not allow user cancellation within 3 days of check-in', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.PENDING,
        checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });

      const cancelDto: CancelReservationDto = {
        reservationId: 1,
        reason: 'Test reason'
      };

      await expect(service.cancel(cancelDto, 1, false)).rejects.toThrow(ForbiddenException);
    });

    it('should allow agent cancellation within 3 days of check-in', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.PENDING,
        checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });

      const cancelDto: CancelReservationDto = {
        reservationId: 1,
        reason: 'Test reason'
      };

      const result = await service.cancel(cancelDto, 2, true);
      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });
  });
});
