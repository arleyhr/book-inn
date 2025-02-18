import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsController } from './controllers/hotels.controller';
import { HotelsService } from './services/hotels.service';
import { RoomsService } from './services/rooms.service';
import { ReviewsService } from './services/reviews.service';
import { GooglePlacesService } from './services/google-places.service';
import { Hotel } from './entities/hotel.entity';
import { Room } from './entities/room.entity';
import { Review } from './entities/review.entity';
import { UsersModule } from '../users/users.module';
import { Amenity } from './entities/amenity.entity';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from './services/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, Room, Review, Amenity]),
    UsersModule,
    AuthModule
  ],
  controllers: [HotelsController],
  providers: [
    HotelsService,
    RoomsService,
    ReviewsService,
    GooglePlacesService,
    CloudinaryService,
  ],
  exports: [HotelsService, RoomsService, ReviewsService, GooglePlacesService, CloudinaryService],
})
export class HotelsModule {}
