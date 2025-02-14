import { registerAs } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Hotel } from '../modules/hotels/entities/hotel.entity';
import { Room } from '../modules/hotels/entities/room.entity';
import { Review } from '../modules/hotels/entities/review.entity';
import { Reservation } from '../modules/reservations/entities/reservation.entity';

const databaseUrl = process.env.DATABASE_URL;

const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'book_inn',
}

const dabaseConfigUrl = {
  url: databaseUrl,
}

export default registerAs('database', () => ({
  ...(databaseUrl ? dabaseConfigUrl : databaseConfig),
  entities: [User, Hotel, Room, Review, Reservation],
  autoLoadEntities: true,
  // synchronize: process.env.NODE_ENV !== 'production',
  synchronize: true,
  logging: process.env.NODE_ENV !== 'production',
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
}));
