# Book Inn API Documentation

This is the API documentation for the Book Inn hotel management system. The API is built with NestJS and provides endpoints for hotel management and reservations.

## Authentication

All endpoints require JWT authentication except for login and registration. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access

The API implements role-based access control with two main roles:
- `agent`: Hotel managers/travel agents
- `user`: Regular users/travelers

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
  "agentId": "number"
}
```

#### Update Hotel (Agent Only)
```http
PUT /hotels/:id
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
- `guests` (optional): Number of guests
- `name` (optional): Hotel name search
- `minPrice` (optional): Minimum room price
- `maxPrice` (optional): Maximum room price
- `rating` (optional): Minimum hotel rating (1-5)

Example:
```http
GET /hotels/search?city=Bogota&checkIn=2024-04-01&checkOut=2024-04-05&guests=2&minPrice=100&maxPrice=300&rating=4
```

Response:
```json
[
  {
    "id": 1,
    "name": "Hotel Example",
    "address": "123 Main St",
    "city": "Bogota",
    "country": "Colombia",
    "rating": 4.5,
    "rooms": [...],
    "amenities": [...],
    "reviews": [...]
  }
]
```

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

#### Toggle Room Availability (Agent Only)
```http
PATCH /hotels/:hotelId/rooms/:id/toggle
```
Enable or disable a room.

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

Example Requests:
```http
# Get all reservations
GET /reservations

# Get reservations for a specific hotel
GET /reservations?hotelId=123

# Get reservations for a date range
GET /reservations?startDate=2024-03-01&endDate=2024-03-31

# Combined filters
GET /reservations?hotelId=123&startDate=2024-03-01&endDate=2024-03-31
```

Response:
```json
[
  {
    "id": 1,
    "checkInDate": "2024-03-15",
    "checkOutDate": "2024-03-20",
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "guestPhone": "+1234567890",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "+1987654321",
    "room": {
      "id": 1,
      "type": "Double",
      "basePrice": 150,
      "hotel": {
        "id": 123,
        "name": "Hotel Example"
      }
    }
  }
]
```

#### Get Hotel Reservations (Agent Only)
```http
GET /reservations/hotel/:hotelId
```
Returns all reservations for a specific hotel.

Response includes the same fields as the list endpoint.

#### Get Reservation Details
```http
GET /reservations/:id
```
Returns detailed information about a specific reservation.

Response includes:
- Reservation details (check-in/out dates)
- Guest information
- Room details
- Hotel information
- Emergency contact information

#### Create Reservation
```http
POST /reservations
```
Create a new reservation.

**Request Body:**
```json
{
  "checkInDate": "2024-02-20",
  "checkOutDate": "2024-02-25",
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

Response includes:
- Reservation details (check-in/out dates, status)
- Guest information
- Room details
- Hotel information
- Emergency contact information
- Cancellation/confirmation details if applicable

### Reviews Management

#### List Hotel Reviews
```http
GET /hotels/:hotelId/reviews
```
Returns all reviews for a specific hotel.

#### Create Review (Authenticated Users)
```http
POST /hotels/:hotelId/reviews
```
Create a new review for a hotel.

**Request Body:**
```json
{
  "rating": "number",
  "comment": "string"
}
```

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
  "totalRooms": 20,
  "occupiedRooms": 15,
  "occupancyRate": 75,
  "upcomingReservations": 5
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
  "totalRevenue": 15000,
  "periodRevenue": 5000,
  "averageRoomRate": 200,
  "reservationsCount": 75
}
```

### Messages

#### Send Message
```http
POST /messages
```
Send a message in the context of a reservation. Only the agent and the traveler involved in the reservation can send messages, and only while the reservation is active (not cancelled or completed).

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
Get all messages for a specific reservation. Only the agent and the traveler involved in the reservation can view the messages.

Response:
```json
[
  {
    "id": 1,
    "message": "Hello, I have a question about the check-in time",
    "senderId": 2,
    "reservationId": 1,
    "createdAt": "2024-02-20T15:30:00Z",
    "sender": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "role": "traveler"
    }
  }
]
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

3. Run the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`. 
