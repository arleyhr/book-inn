import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HotelsService } from '../../hotels/services/hotels.service';
import { RoomsService } from '../../hotels/services/rooms.service';
import { ReviewsService } from '../../hotels/services/reviews.service';
import { GooglePlacesService } from '../../hotels/services/google-places.service';
import { UsersService } from '../../users/services/users.service';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  private readonly colombianCities = [
    'Bogotá',
    'Medellín',
    'Cartagena',
    'Santa Marta',
    'Cali',
    'Barranquilla',
    'San Andrés',
    'Villa de Leyva',
    'Bucaramanga',
    'Pereira'
  ];

  private readonly roomTypes = [
    'Habitación Individual',
    'Habitación Doble',
    'Habitación Triple',
    'Suite Junior',
    'Suite Ejecutiva',
    'Suite Presidencial',
    'Habitación Familiar',
    'Habitación Deluxe',
    'Penthouse'
  ];

  private readonly roomLocations = [
    'Piso bajo con vista al jardín',
    'Pisos intermedios con vista a la ciudad',
    'Pisos superiores con vista panorámica',
    'Área de la piscina',
    'Zona exclusiva',
    'Ala norte del edificio',
    'Ala sur del edificio',
    'Torre principal',
    'Área VIP'
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly hotelsService: HotelsService,
    private readonly roomsService: RoomsService,
    private readonly reviewsService: ReviewsService,
    private readonly googlePlacesService: GooglePlacesService,
    private readonly usersService: UsersService,
  ) {}

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private generateRoomTypes(priceLevel: number) {
    const basePrice = (priceLevel || 2) * 100;
    const numberOfRooms = this.getRandomNumber(3, 6);
    const rooms = [];

    for (let i = 0; i < numberOfRooms; i++) {
      const priceFactor = 0.8 + (Math.random() * 2.2);
      const finalBasePrice = Math.round(basePrice * priceFactor);
      const taxRate = (16 + Math.random() * 5) / 100;

      rooms.push({
        type: this.getRandomElement(this.roomTypes),
        basePrice: finalBasePrice,
        taxes: Math.round(finalBasePrice * taxRate),
        location: this.getRandomElement(this.roomLocations)
      });
    }

    return rooms;
  }

  async generateSeedData(count = 10) {
    try {
      this.logger.log(`Starting seed data generation for ${count} hotels`);

      const agentEmail = 'agent@bookinn.com';
      this.logger.log(`Looking for agent user: ${agentEmail}`);
      let agent = await this.usersService.findByEmail(agentEmail);

      if (!agent) {
        this.logger.log('Agent user not found, creating new agent');
        agent = await this.usersService.create({
          email: agentEmail,
          password: 'password123',
          firstName: 'Test',
          lastName: 'Agent',
          role: UserRole.AGENT,
        });
        this.logger.log(`Created new agent with ID: ${agent.id}`);
      }

      const hotelsPerCity = Math.ceil(count / this.colombianCities.length);
      let totalHotels = 0;

      for (const city of this.colombianCities) {
        if (totalHotels >= count) break;

        this.logger.log(`Searching hotels in ${city}`);
        const hotels = await this.googlePlacesService.searchHotels(city);

        for (const hotel of hotels.slice(0, hotelsPerCity)) {
          if (totalHotels >= count) break;

          try {
            const details = await this.googlePlacesService.getPlaceDetails(hotel.place_id);

            if (!details || !details.name || !details.formatted_address || !details.geometry?.location) {
              this.logger.warn(`Skipping hotel with incomplete data: ${hotel.place_id}`);
              continue;
            }

            this.logger.debug(`Creating hotel: ${details.name}`);
            const newHotel = await this.hotelsService.create({
              name: details.name,
              address: details.formatted_address,
              city,
              country: 'Colombia',
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              agentId: agent.id,
              placeId: hotel.place_id,
            });
            this.logger.log(`Created hotel with ID: ${newHotel.id}`);

            const amenities = details.amenities || [];
            if (amenities.length > 0) {
              const amenityEntities = [];
              for (const amenityName of amenities) {
                const amenity = await this.hotelsService.createOrFindService(amenityName);
                amenityEntities.push(amenity);
              }
              newHotel.amenities = amenityEntities;
              await this.hotelsService.save(newHotel);
              this.logger.debug(`Added ${amenityEntities.length} amenities to hotel ${newHotel.id}`);
            }

            const roomTypes = this.generateRoomTypes(details.price_level);
            for (const roomData of roomTypes) {
              const room = await this.roomsService.create({
                ...roomData,
                hotelId: newHotel.id,
              });
              this.logger.debug(`Created room with ID: ${room.id}`);
            }

            if (details.reviews) {
              for (const review of details.reviews.slice(0, 5)) {
                await this.reviewsService.create({
                  rating: review.rating,
                  comment: review.text,
                  hotelId: newHotel.id,
                  userId: agent.id,
                });
              }
            }

            totalHotels++;
          } catch (error) {
            this.logger.error(`Error processing hotel ${hotel.place_id}:`, error);
            continue;
          }
        }
      }

      this.logger.log('Seed data generation completed successfully');
      return { message: 'Seed data generated successfully' };
    } catch (error) {
      this.logger.error('Error generating seed data:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }
}
