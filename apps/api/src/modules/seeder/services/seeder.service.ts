import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HotelsService } from '../../hotels/services/hotels.service';
import { RoomsService } from '../../hotels/services/rooms.service';
import { ReviewsService } from '../../hotels/services/reviews.service';
import { GooglePlacesService } from '../../hotels/services/google-places.service';
import { CloudinaryService } from '../../hotels/services/cloudinary.service';
import { UsersService } from '../../users/services/users.service';
import { UserRole } from '../../users/entities/user.entity';
import { ReservationsService } from '../../reservations/services/reservations.service';
import { MessagesService } from '../../reservations/services/messages.service';
import * as bcrypt from 'bcrypt';

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

  private readonly travelerNames = [
    { firstName: 'Juan', lastName: 'Pérez' },
    { firstName: 'María', lastName: 'González' },
    { firstName: 'Carlos', lastName: 'Rodríguez' },
    { firstName: 'Ana', lastName: 'Martínez' },
    { firstName: 'Luis', lastName: 'Sánchez' },
    { firstName: 'Laura', lastName: 'López' },
    { firstName: 'Diego', lastName: 'Torres' },
    { firstName: 'Sofía', lastName: 'Ramírez' },
    { firstName: 'Andrés', lastName: 'Herrera' },
    { firstName: 'Valentina', lastName: 'Díaz' }
  ];

  private readonly messageTemplates = [
    '¿A qué hora es el check-in?',
    'Necesito solicitar un late check-out',
    '¿Tienen servicio de transporte desde el aeropuerto?',
    '¿El desayuno está incluido?',
    'Llegaremos tarde, después de las 10 PM',
    '¿Tienen caja fuerte en la habitación?',
    '¿Puedo solicitar una cama adicional?',
    'Necesito información sobre el parqueadero',
    '¿Tienen servicio a la habitación 24 horas?',
    'Somos alérgicos, necesitamos almohadas hipoalergénicas'
  ];

  private readonly agentResponses = [
    'El check-in es a partir de las 3 PM',
    'El late check-out tiene un costo adicional del 50% de la tarifa',
    'Sí, tenemos servicio de transporte. El costo es de $50.000',
    'Sí, el desayuno buffet está incluido de 6 AM a 10 AM',
    'No hay problema, nuestra recepción está abierta 24/7',
    'Sí, todas las habitaciones cuentan con caja fuerte digital',
    'Podemos agregar una cama por $100.000 adicionales por noche',
    'Tenemos parqueadero cubierto sin costo adicional',
    'El servicio a la habitación opera hasta las 11 PM',
    'Con gusto prepararemos su habitación con elementos hipoalergénicos'
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly hotelsService: HotelsService,
    private readonly roomsService: RoomsService,
    private readonly reviewsService: ReviewsService,
    private readonly googlePlacesService: GooglePlacesService,
    private readonly usersService: UsersService,
    private readonly reservationsService: ReservationsService,
    private readonly messagesService: MessagesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private generateRoomTypes(priceLevel: number) {
    const basePrice = (priceLevel || 2) * 100;
    const numberOfRooms = this.getRandomNumber(3, 6);
    const rooms = [];

    for (let i = 0; i < numberOfRooms; i++) {
      const priceFactor = 0.8 + (Math.random() * 2.2);
      const finalBasePrice = Math.round(basePrice * priceFactor);
      const taxPercentage = Math.round((Math.random() * 15) * 100) / 100;
      const guestCapacity = this.getRandomNumber(1, 6);

      rooms.push({
        type: this.getRandomElement(this.roomTypes),
        basePrice: finalBasePrice,
        taxes: taxPercentage,
        location: this.getRandomElement(this.roomLocations),
        guestCapacity
      });
    }

    return rooms;
  }

  private async createTravelers() {
    const travelers = [];
    for (const { firstName, lastName } of this.travelerNames) {
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      let traveler = await this.usersService.findByEmail(email);

      if (!traveler) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        traveler = await this.usersService.create({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: UserRole.TRAVELER,
        });
      }
      travelers.push(traveler);
    }
    return travelers;
  }

  private async generateReservations(rooms: any[], travelers: any[], agent: any) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    for (const room of rooms) {
      const reservationsCount = this.getRandomNumber(2, 5);

      for (let i = 0; i < reservationsCount; i++) {
        const traveler = this.getRandomElement(travelers);
        const checkInDate = this.getRandomDate(startDate, endDate);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + this.getRandomNumber(1, 7));

        const reservation = await this.reservationsService.create({
          checkInDate: checkInDate.toISOString().split('T')[0],
          checkOutDate: checkOutDate.toISOString().split('T')[0],
          guestName: `${traveler.firstName} ${traveler.lastName}`,
          guestEmail: traveler.email,
          guestPhone: `+57${this.getRandomNumber(300, 350)}${this.getRandomNumber(1000000, 9999999)}`,
          emergencyContactName: this.getRandomElement(this.travelerNames).firstName,
          emergencyContactPhone: `+57${this.getRandomNumber(300, 350)}${this.getRandomNumber(1000000, 9999999)}`,
          roomId: room.id,
          userId: traveler.id
        });

        if (Math.random() > 0.3) {
          await this.reservationsService.confirm({
            reservationId: reservation.id
          }, agent.id);

          const messagesCount = this.getRandomNumber(1, 4);
          for (let j = 0; j < messagesCount; j++) {
            await this.messagesService.sendMessage({
              reservationId: reservation.id,
              message: this.getRandomElement(this.messageTemplates)
            }, traveler.id);

            await this.messagesService.sendMessage({
              reservationId: reservation.id,
              message: this.getRandomElement(this.agentResponses)
            }, agent.id);
          }
        }

        if (Math.random() < 0.2) {
          await this.reservationsService.cancel({
            reservationId: reservation.id,
            reason: 'Cambio de planes'
          }, Math.random() > 0.5 ? agent.id : traveler.id, Math.random() > 0.5);
        }
      }
    }
  }

  async generateSeedData(count = 10) {
    try {
      this.logger.log(`Starting seed data generation for ${count} hotels`);

      const agentEmail = 'agent@bookinn.com';
      this.logger.log(`Looking for agent user: ${agentEmail}`);
      let agent = await this.usersService.findByEmail(agentEmail);

      if (!agent) {
        this.logger.log('Agent user not found, creating new agent');
        const hashedPassword = await bcrypt.hash('password123', 10);
        agent = await this.usersService.create({
          email: agentEmail,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Agent',
          role: UserRole.AGENT,
        });
        this.logger.log(`Created new agent with ID: ${agent.id}`);
      }

      const travelers = await this.createTravelers();
      this.logger.log(`Created ${travelers.length} travelers`);

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
            console.log(details)

            if (!details || !details.name || !details.formatted_address || !details.geometry?.location) {
              this.logger.warn(`Skipping hotel with incomplete data: ${hotel.place_id}`);
              continue;
            }

            this.logger.debug(`Creating hotel: ${details.name}`);

            const photoUrls = await this.googlePlacesService.getPlacePhotos(details.photos || []);
            const cloudinaryUrls = [];

            for (const photoUrl of photoUrls) {
              try {
                const cloudinaryUrl = await this.cloudinaryService.uploadImage(photoUrl);
                cloudinaryUrls.push(cloudinaryUrl);
              } catch (error) {
                this.logger.warn(`Failed to upload image to Cloudinary: ${error.message}`);
                continue;
              }
            }

            const newHotel = await this.hotelsService.create({
              name: details.name,
              address: details.formatted_address,
              city,
              country: 'Colombia',
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              agentId: agent.id,
              placeId: hotel.place_id,
              images: cloudinaryUrls,
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
            const createdRooms = [];
            for (const roomData of roomTypes) {
              const room = await this.roomsService.create({
                ...roomData,
                hotelId: newHotel.id,
              });
              createdRooms.push(room);
              this.logger.debug(`Created room with ID: ${room.id}`);
            }

            await this.generateReservations(createdRooms, travelers, agent);
            this.logger.debug(`Generated reservations and messages for hotel ${newHotel.id}`);

            if (details.reviews) {
              for (const review of details.reviews.slice(0, 5)) {
                const reviewer = this.getRandomElement(travelers);
                await this.reviewsService.create({
                  rating: review.rating,
                  comment: review.text,
                  hotelId: newHotel.id,
                  userId: reviewer.id,
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
