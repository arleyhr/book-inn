# Book Inn API Documentation

This is the API documentation for the Book Inn hotel management system. The API is built with NestJS and provides endpoints for hotel management and reservations.

## Authentication

All endpoints require JWT authentication except for login and registration. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
```
Register a new user.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "agent | traveler"
}
```

#### Login
```http
POST /auth/login
```
Login with email and password.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "number",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
```
Get new access token using refresh token.

**Request Body:**
```json
{
  "userId": "number",
  "refreshToken": "string"
}
```

#### Get Current User
```http
GET /auth/me
```
Get current authenticated user information.

## Role-Based Access

The API implements role-based access control with two main roles:
- `agent`: Hotel managers/travel agents
- `traveler`: Regular users/travelers

## API Endpoints

### Hotels Management

#### List Hotels
```http
GET /hotels
```
Returns a list of all hotels.

#### Get Hotel Details
```http
GET /hotels/:id
```
Returns detailed information about a specific hotel.

#### Create Hotel (Agent Only)
```http
POST /hotels
```
Create a new hotel.

**Request Body:**
```json
{
  "name": "string",
  "address": "string",
  "city": "string",
  "country": "string",
  "latitude": "number",
  "longitude": "number",
  "images": "string[]",
  "isActive": "boolean",
  "placeId": "string",
  "rooms": [
    {
      "type": "string",
      "basePrice": "number",
      "taxes": "number",
      "location": "string",
      "isAvailable": "boolean"
    }
  ]
}
```

#### Update Hotel (Agent Only)
```http
PATCH /hotels/:id
```
Update an existing hotel.

#### Delete Hotel (Agent Only)
```http
DELETE /hotels/:id
```
Delete a hotel.

#### Search Hotels
```http
GET /hotels/search
```
Search for hotels with various filters.

Query Parameters:
- `city` (optional): Filter by city name
- `country` (optional): Filter by country name
- `checkIn` (optional): Check-in date (YYYY-MM-DD)
- `checkOut` (optional): Check-out date (YYYY-MM-DD)
- `name` (optional): Hotel name search
- `minPrice` (optional): Minimum room price
- `maxPrice` (optional): Maximum room price
- `rating` (optional): Minimum hotel rating (1-5)

#### Get Featured Hotels
```http
GET /hotels/featured
```
Returns a random selection of active hotels.

Query Parameters:
- `limit` (optional): Number of hotels to return (default: 6)

#### Get Agent Hotels (Agent Only)
```http
GET /hotels/fetch/by-agent
```
Returns all hotels managed by the authenticated agent.

#### Toggle Room Availability (Agent Only)
```http
PUT /hotels/:hotelId/rooms/:roomId/toggle
```
Enable or disable a room.

### Rooms Management

#### List Hotel Rooms
```http
GET /hotels/:hotelId/rooms
```
Returns all rooms for a specific hotel.

#### Create Room (Agent Only)
```http
POST /hotels/:hotelId/rooms
```
Create a new room in a hotel.

**Request Body:**
```json
{
  "type": "string",
  "basePrice": "number",
  "taxes": "number",
  "location": "string",
  "isAvailable": "boolean"
}
```

#### Update Room (Agent Only)
```http
PUT /hotels/:hotelId/rooms/:id
```
Update room details.

### Reservations Management

#### List Agent's Reservations (Agent Only)
```http
GET /reservations
```
Returns all reservations for hotels managed by the authenticated agent.

Query Parameters:
- `hotelId` (optional): Filter reservations by specific hotel ID
- `startDate` (optional): Filter reservations starting from this date (YYYY-MM-DD)
- `endDate` (optional): Filter reservations until this date (YYYY-MM-DD)

#### Get Hotel Reservations (Agent Only)
```http
GET /reservations/hotel/:hotelId
```
Returns all reservations for a specific hotel.

#### Get Reservation Details
```http
GET /reservations/:id
```
Returns detailed information about a specific reservation.

#### Create Reservation
```http
POST /reservations
```
Create a new reservation.

**Request Body:**
```json
{
  "checkInDate": "string (YYYY-MM-DD)",
  "checkOutDate": "string (YYYY-MM-DD)",
  "guestName": "string",
  "guestEmail": "string",
  "guestPhone": "string",
  "emergencyContactName": "string",
  "emergencyContactPhone": "string",
  "roomId": "number"
}
```

#### Confirm Reservation (Agent Only)
```http
POST /reservations/confirm
```
Confirm a pending reservation.

**Request Body:**
```json
{
  "reservationId": "number"
}
```

#### Cancel Reservation
```http
POST /reservations/cancel
```
Cancel a reservation. Travelers can only cancel their own reservations and not within 3 days of check-in. Agents can cancel any reservation at any time.

**Request Body:**
```json
{
  "reservationId": "number",
  "reason": "string"
}
```

#### Update Reservation Status (Agent Only)
```http
PATCH /reservations/:id/status
```
Update the status of a reservation.

**Request Body:**
```json
{
  "status": "pending | confirmed | cancelled | completed"
}
```

#### Validate Room Availability
```http
GET /reservations/fetch/validate-availability
```
Check if a room is available for the specified dates.

Query Parameters:
- `hotelId`: Hotel ID
- `checkIn`: Check-in date (YYYY-MM-DD)
- `checkOut`: Check-out date (YYYY-MM-DD)

### Messages

#### Send Message
```http
POST /messages
```
Send a message in the context of a reservation.

**Request Body:**
```json
{
  "reservationId": "number",
  "message": "string"
}
```

#### Get Reservation Messages
```http
GET /messages/reservation/:reservationId
```
Get all messages for a specific reservation.

### Statistics (Agent Only)

#### Get Hotel Occupancy Stats
```http
GET /statistics/occupancy
```
Get occupancy statistics for a specific hotel.

Query Parameters:
- `hotelId`: Hotel ID
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

Response:
```json
{
  "totalRooms": "number",
  "occupiedRooms": "number",
  "occupancyRate": "number",
  "upcomingReservations": "number"
}
```

#### Get Hotel Revenue Stats
```http
GET /statistics/revenue
```
Get revenue statistics for a specific hotel.

Query Parameters:
- `hotelId`: Hotel ID
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

Response:
```json
{
  "totalRevenue": "number",
  "periodRevenue": "number",
  "averageRoomRate": "number",
  "reservationsCount": "number"
}
```

## Error Responses

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "statusCode": "number",
  "message": "string",
  "error": "string"
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests

## Data Pagination

List endpoints support pagination using query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Example:
```http
GET /hotels?page=2&limit=20
```

## Development

The API is part of a monorepo structure and is located in the `apps/api` directory. To run the API locally:

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
- `JWT_SECRET`: Secret key for JWT access tokens
- `JWT_REFRESH_TOKEN_SECRET`: Secret key for JWT refresh tokens
- `DATABASE_URL`: PostgreSQL connection URL

3. Run the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`. 
