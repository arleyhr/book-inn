import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class GooglePlacesService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly axios = axios;

  constructor(private readonly configService: ConfigService, private readonly cloudinaryService: CloudinaryService) {
    this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
  }

  async searchHotels(city: string) {
    try {
      const response = await this.axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query: `hoteles en ${city} Colombia`,
          type: 'lodging',
          key: this.apiKey,
          language: 'es-CO',
        },
      });

      if (!response.data?.results) {
        throw new Error('Invalid response from Google Places API');
      }

      return response.data.results;
    } catch (error) {
      this.logger.error('Error searching hotels:', error);
      if (error.message === 'Invalid response from Google Places API') {
        throw error;
      }
      throw new Error('Error searching hotels');
    }
  }

  async getPlaceDetails(placeId: string) {
    try {
      this.logger.debug(`Getting place details for ID: ${placeId}`);

      const response = await this.axios.get(`${this.baseUrl}/details/json`, {
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
      if (error.message === 'Invalid response from Google Places API' ||
          error.message === 'Missing required place details') {
        throw error;
      }
      throw new Error('Error getting place details');
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

  async getPlacePhotos(photos: any[]): Promise<string[]> {
    try {
      const photoUrls: string[] = [];

      if (photos && photos.length > 0) {
        const selectedPhotos = photos.slice(0, 3);

        for (const photo of selectedPhotos) {
          if (photo.photo_reference) {
            const photoUrl = this.getPhotoUrl(photo.photo_reference);
            const cloudinaryUrl = await this.cloudinaryService.uploadImage(photoUrl);

            if (cloudinaryUrl) {
              photoUrls.push(cloudinaryUrl);
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
}
