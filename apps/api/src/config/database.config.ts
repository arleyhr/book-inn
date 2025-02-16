import { registerAs } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Hotel } from '../modules/hotels/entities/hotel.entity';
import { Room } from '../modules/hotels/entities/room.entity';
import { Review } from '../modules/hotels/entities/review.entity';
import { Reservation } from '../modules/reservations/entities/reservation.entity';

const databaseUrl = process.env.DATABASE_URL;

const ssl = {
  ssl: {
    rejectUnauthorized: false
  }
}

const databaseConfig = {
  type: 'mysql',
  host: process.env.MYSQL_HOST || process.env.AZURE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || process.env.AZURE_MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER || process.env.AZURE_MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.AZURE_MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.AZURE_MYSQL_DATABASE || 'book_inn',
  ...(process.env.MYSQL_SSL || process.env.AZURE_MYSQL_SSL ? ssl : {})
}

const dabaseConfigUrl = {
  type: 'mysql',
  url: databaseUrl,
}

export default registerAs('database', () => ({
  ...(databaseUrl ? dabaseConfigUrl : databaseConfig),
  entities: [User, Hotel, Room, Review, Reservation],
  autoLoadEntities: true,
  synchronize: true,
  logging: process.env.NODE_ENV !== 'production',
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
}));
