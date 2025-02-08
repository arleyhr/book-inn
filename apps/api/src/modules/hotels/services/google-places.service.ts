import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class GooglePlacesService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly cacheDir = 'uploads/hotels';
  private readonly cacheDuration = 24 * 60 * 60 * 1000;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
    this.ensureCacheDirExists();
  }

  private ensureCacheDirExists() {
    const dir = path.join(process.cwd(), this.cacheDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private generateCacheFileName(photoReference: string): string {
    const hash = crypto.createHash('md5').update(photoReference).digest('hex');
    return `${hash}.jpg`;
  }

  private getCacheFilePath(photoReference: string): string {
    const fileName = this.generateCacheFileName(photoReference);
    return path.join(process.cwd(), this.cacheDir, fileName);
  }

  private isCacheValid(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      const age = Date.now() - stats.mtimeMs;
      return age < this.cacheDuration;
    } catch {
      return false;
    }
  }

  async searchHotels(city: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query: `hoteles en ${city} Colombia`,
          type: 'lodging',
          key: this.apiKey,
          language: 'es-CO',
        },
      });

      return response.data.results;
    } catch (error) {
      this.logger.error('Error searching hotels:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string) {
    try {
      this.logger.debug(`Getting place details for ID: ${placeId}`);

      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          key: this.apiKey,
          language: 'es-CO',
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'photos',
            'rating',
            'reviews',
            'price_level',
            'type',
            'wheelchair_accessible_entrance',
            'business_status',
            'formatted_phone_number'
          ].join(',')
        },
      });

      if (!response.data || !response.data.result) {
        this.logger.error('Invalid response from Google Places API:', response.data);
        throw new Error('Invalid response from Google Places API');
      }

      const result = response.data.result;

      if (!result.geometry || !result.geometry.location) {
        this.logger.error('Missing geometry or location in place details:', result);
        throw new Error('Missing required place details');
      }

      this.logger.debug('Place types:', result.types);

      return {
        ...result,
        amenities: this.processAmenities(result)
      };
    } catch (error) {
      this.logger.error('Error getting place details:', error);
      this.logger.error('Error response:', error.response?.data);
      throw error;
    }
  }

  private processAmenities(placeDetails: any): string[] {
    const amenities = new Set<string>();
    const types = placeDetails?.types || [];
    this.logger.debug('Processing types:', types);

    const typeMap: { [key: string]: string } = {
      'lodging': 'Alojamiento',
      'spa': 'Spa',
      'restaurant': 'Restaurante',
      'bar': 'Bar',
      'gym': 'Gimnasio',
      'parking': 'Estacionamiento',
      'airport_shuttle': 'Transporte al aeropuerto',
      'fitness_center': 'Centro de fitness',
      'swimming_pool': 'Piscina',
      'business_center': 'Centro de negocios',
      'meeting_room': 'Sala de reuniones',
      'cafe': 'Cafetería',
      'atm': 'Cajero automático',
      'laundry': 'Lavandería'
    };

    types.forEach((type: string) => {
      if (typeMap[type]) {
        amenities.add(typeMap[type]);
      }
    });

    if (placeDetails.wheelchair_accessible_entrance) {
      amenities.add('Acceso para sillas de ruedas');
    }

    const defaultAmenities = [
      'WiFi',
      'Aire acondicionado',
      'TV',
      'Servicio de limpieza',
      'Recepción 24 horas'
    ];

    defaultAmenities.forEach(amenity => {
      amenities.add(amenity);
    });

    return Array.from(amenities);
  }

  private getPhotoUrl(photoReference: string): string {
    return `${this.baseUrl}/photo?maxwidth=800&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  private async downloadAndCachePhoto(photoReference: string): Promise<string> {
    try {
      const photoUrl = this.getPhotoUrl(photoReference);
      const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });

      const filePath = this.getCacheFilePath(photoReference);
      await fs.promises.writeFile(filePath, response.data);

      return `/${this.cacheDir}/${this.generateCacheFileName(photoReference)}`;
    } catch (error) {
      this.logger.error(`Error downloading photo ${photoReference}:`, error);
      return null;
    }
  }

  async getPlacePhotos(photos: any[]): Promise<string[]> {
    try {
      const photoUrls: string[] = [];

      if (photos && photos.length > 0) {
        const selectedPhotos = photos.slice(0, 3);

        for (const photo of selectedPhotos) {
          if (photo.photo_reference) {
            const cacheFilePath = this.getCacheFilePath(photo.photo_reference);

            let photoUrl: string;
            if (this.isCacheValid(cacheFilePath)) {
              photoUrl = `/${this.cacheDir}/${this.generateCacheFileName(photo.photo_reference)}`;
            } else {
              photoUrl = await this.downloadAndCachePhoto(photo.photo_reference);
            }

            if (photoUrl) {
              photoUrls.push(photoUrl);
            }
          }
        }
      }

      return photoUrls;
    } catch (error) {
      this.logger.error('Error getting place photos:', error);
      return [];
    }
  }

  async refreshHotelPhotos(placeId: string): Promise<string[]> {
    try {
      const details = await this.getPlaceDetails(placeId);
      if (details && details.photos) {
        return this.getPlacePhotos(details.photos);
      }
      return [];
    } catch (error) {
      this.logger.error(`Error refreshing photos for place ${placeId}:`, error);
      return [];
    }
  }
}
