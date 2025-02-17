import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GooglePlacesService } from '../google-places.service';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('axios');
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
  },
  statSync: jest.fn(),
}));
jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('GooglePlacesService', () => {
  let service: GooglePlacesService;
  let mockAxios: jest.Mocked<typeof axios>;
  let mockConfigService: jest.Mocked<ConfigService>;
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://maps.googleapis.com/maps/api/place';

  beforeEach(async () => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      isAxiosError: jest.fn(),
      request: jest.fn(),
      delete: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      getUri: jest.fn(),
      defaults: { headers: { common: {} } }
    } as any;

    mockConfigService = {
      get: jest.fn().mockReturnValue('fake_api_key')
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GooglePlacesService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ],
    }).compile();

    service = module.get<GooglePlacesService>(GooglePlacesService);
    (service as any).axios = mockAxios;

    jest.clearAllMocks();
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchHotels', () => {
    const mockCity = 'Bogotá';
    const mockSearchResponse = {
      data: {
        results: [
          {
            place_id: 'test_place_id',
            name: 'Test Hotel',
          },
        ],
      },
    };

    it('should search hotels successfully', async () => {
      mockAxios.get.mockResolvedValue(mockSearchResponse);

      const result = await service.searchHotels(mockCity);

      expect(result).toEqual(mockSearchResponse.data.results);
      expect(mockAxios.get).toHaveBeenCalledWith(`${mockBaseUrl}/textsearch/json`, {
        params: {
          query: `hoteles en ${mockCity} Colombia`,
          type: 'lodging',
          key: 'fake_api_key',
          language: 'es-CO',
        },
      });
    });

    it('should handle API errors gracefully', async () => {
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.searchHotels('test query')).rejects.toThrow('Error searching hotels');
    });

    it('should handle invalid responses', async () => {
      mockAxios.get.mockResolvedValue({ data: {} });

      await expect(service.searchHotels('test query')).rejects.toThrow('Invalid response from Google Places API');
    });
  });

  describe('getPlaceDetails', () => {
    const mockPlaceId = 'test_place_id';
    const mockDetailsResponse = {
      data: {
        result: {
          name: 'Test Hotel',
          formatted_address: 'Test Address',
          geometry: {
            location: {
              lat: 4.710989,
              lng: -74.072092,
            },
          },
          types: ['lodging', 'restaurant'],
        },
      },
    };

    it('should get place details successfully', async () => {
      mockAxios.get.mockResolvedValueOnce(mockDetailsResponse);

      const result = await service.getPlaceDetails(mockPlaceId);

      expect(result).toEqual({
        ...mockDetailsResponse.data.result,
        amenities: expect.any(Array),
      });
      expect(mockAxios.get).toHaveBeenCalledWith(`${mockBaseUrl}/details/json`, {
        params: {
          place_id: mockPlaceId,
          key: 'fake_api_key',
          language: 'es-CO',
          fields: 'name,formatted_address,geometry,photos,rating,reviews,price_level,type,wheelchair_accessible_entrance,business_status,formatted_phone_number',
        },
      });
    });

    it('should handle missing geometry', async () => {
      mockAxios.get.mockResolvedValue({
        data: {
          result: {
            name: 'Test Hotel'
          }
        }
      });

      await expect(service.getPlaceDetails('test_place_id')).rejects.toThrow('Missing required place details');
    });

    it('should handle API errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getPlaceDetails('test_place_id')).rejects.toThrow('Error getting place details');
    });
  });

  describe('getPlacePhotos', () => {
    const mockPhotoReference = 'test_photo_reference';
    const mockPhotos = [{ photo_reference: mockPhotoReference }];
    const mockPhotoData = Buffer.from('test-photo-data');

    beforeEach(() => {
      (fs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });
    });

    it('should get and cache photos successfully', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: mockPhotoData });
      (fs.promises.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.getPlacePhotos(mockPhotos);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/^\/uploads\/hotels\/.+\.jpg$/);
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        mockPhotoData
      );
    });

    it('should use cached photos when valid', async () => {
      (fs.statSync as jest.Mock).mockReturnValue({
        mtimeMs: Date.now(),
      });

      const result = await service.getPlacePhotos(mockPhotos);

      expect(result).toHaveLength(1);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should handle photo download errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Download Error'));

      await expect(service.downloadPhoto(mockPhotoReference)).rejects.toThrow('Error downloading photo');
    });

    it('should handle empty photos array', async () => {
      const result = await service.getPlacePhotos([]);

      expect(result).toEqual([]);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should handle general errors and return empty array', async () => {
      (fs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.getPlacePhotos(mockPhotos);

      expect(result).toEqual([]);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error downloading photo test_photo_reference:',
        expect.any(Error)
      );

      loggerErrorSpy.mockRestore();
    });
  });

  describe('refreshHotelPhotos', () => {
    const mockPlaceId = 'test_place_id';
    const mockDetails = {
      photos: [{ photo_reference: 'test_photo_reference' }],
    };

    it('should refresh hotel photos successfully', async () => {
      jest.spyOn(service, 'getPlaceDetails').mockResolvedValueOnce(mockDetails);
      jest.spyOn(service, 'getPlacePhotos').mockResolvedValueOnce(['/path/to/photo.jpg']);

      const result = await service.refreshHotelPhotos(mockPlaceId);

      expect(result).toEqual(['/path/to/photo.jpg']);
      expect(service.getPlaceDetails).toHaveBeenCalledWith(mockPlaceId);
      expect(service.getPlacePhotos).toHaveBeenCalledWith(mockDetails.photos);
    });

    it('should handle missing photos in place details', async () => {
      jest.spyOn(service, 'getPlaceDetails').mockResolvedValueOnce({});

      const result = await service.refreshHotelPhotos(mockPlaceId);

      expect(result).toEqual([]);
    });

    it('should handle errors during refresh', async () => {
      jest.spyOn(service, 'getPlaceDetails').mockRejectedValueOnce(new Error('API Error'));

      const result = await service.refreshHotelPhotos(mockPlaceId);

      expect(result).toEqual([]);
    });
  });

  describe('ensureCacheDirExists', () => {
    it('should create cache directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      new GooglePlacesService(mockConfigService);

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('uploads/hotels'),
        { recursive: true }
      );
    });

    it('should not create cache directory if it already exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      new GooglePlacesService(mockConfigService);

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('processAmenities', () => {
    it('should process hotel types into amenities', () => {
      const placeDetails = {
        types: ['lodging', 'spa', 'restaurant'],
        wheelchair_accessible_entrance: true
      };

      const result = service['processAmenities'](placeDetails);

      expect(result).toContain('Alojamiento');
      expect(result).toContain('Spa');
      expect(result).toContain('Restaurante');
      expect(result).toContain('Acceso para sillas de ruedas');
      expect(result).toContain('WiFi');
      expect(result).toContain('Aire acondicionado');
    });

    it('should handle missing types', () => {
      const placeDetails = {
        wheelchair_accessible_entrance: false
      };

      const result = service['processAmenities'](placeDetails);

      expect(result).toContain('WiFi');
      expect(result).toContain('Aire acondicionado');
      expect(result).not.toContain('Acceso para sillas de ruedas');
    });

    it('should handle unknown types', () => {
      const placeDetails = {
        types: ['unknown_type', 'another_unknown'],
        wheelchair_accessible_entrance: false
      };

      const result = service['processAmenities'](placeDetails);

      expect(result).toContain('WiFi');
      expect(result).toContain('Aire acondicionado');
      expect(result.length).toBe(5);
    });
  });

  describe('file cache utilities', () => {
    const photoReference = 'test_photo_reference';

    it('should generate consistent cache file names', () => {
      const fileName1 = service['generateCacheFileName'](photoReference);
      const fileName2 = service['generateCacheFileName'](photoReference);

      expect(fileName1).toBe(fileName2);
      expect(fileName1).toMatch(/\.jpg$/);
    });

    it('should generate valid cache file paths', () => {
      const filePath = service['getCacheFilePath'](photoReference);

      expect(filePath).toContain('uploads/hotels');
      expect(filePath).toMatch(/\.jpg$/);
    });

    it('should validate cache correctly', () => {
      const filePath = service['getCacheFilePath'](photoReference);

      (fs.statSync as jest.Mock).mockReturnValue({
        mtimeMs: Date.now() - 1000
      });
      expect(service['isCacheValid'](filePath)).toBe(true);

      (fs.statSync as jest.Mock).mockReturnValue({
        mtimeMs: Date.now() - (25 * 60 * 60 * 1000)
      });
      expect(service['isCacheValid'](filePath)).toBe(false);

      (fs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });
      expect(service['isCacheValid'](filePath)).toBe(false);
    });
  });

  describe('getPhotoUrl', () => {
    it('should generate correct photo URL', () => {
      const photoReference = 'test_photo_reference';
      const url = service['getPhotoUrl'](photoReference);

      expect(url).toBe(`${mockBaseUrl}/photo?maxwidth=800&photo_reference=${photoReference}&key=fake_api_key`);
    });
  });
});
