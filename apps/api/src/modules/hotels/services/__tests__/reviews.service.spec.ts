import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsService } from '../reviews.service';
import { Review } from '../../entities/review.entity';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: Repository<Review>;

  const mockReview = {
    id: 1,
    rating: 4,
    comment: 'Great hotel!',
    userId: 1,
    hotelId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new review', async () => {
      const createReviewDto = {
        rating: 4,
        comment: 'Great hotel!',
        userId: 1,
        hotelId: 1,
      };

      mockReviewRepository.create.mockReturnValue(mockReview);
      mockReviewRepository.save.mockResolvedValue(mockReview);

      const result = await service.create(createReviewDto);

      expect(result).toEqual(mockReview);
      expect(reviewRepository.create).toHaveBeenCalledWith(createReviewDto);
      expect(reviewRepository.save).toHaveBeenCalledWith(mockReview);
    });

    it('should handle validation of rating', async () => {
      const createReviewDto = {
        rating: 6, // Rating mayor a 5 debería fallar
        comment: 'Great hotel!',
        userId: 1,
        hotelId: 1,
      };

      mockReviewRepository.create.mockImplementation(() => {
        throw new Error('Invalid rating value');
      });

      await expect(service.create(createReviewDto)).rejects.toThrow('Invalid rating value');
    });
  });
});
