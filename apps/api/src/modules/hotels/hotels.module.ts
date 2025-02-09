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

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, Room, Review, Amenity]),
    UsersModule
  ],
  controllers: [HotelsController],
  providers: [HotelsService, RoomsService, ReviewsService, GooglePlacesService],
  exports: [HotelsService, RoomsService, ReviewsService, GooglePlacesService],
})
export class HotelsModule {}
