# Book Inn 🏨 

<div align="center">
  <img src="apps/web-react/public/logo.png" alt="Book Inn Logo" width="200"/>
  <p><em>Your Ultimate Hotel Booking Experience</em></p>
</div>

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?logo=google-maps&logoColor=white)
![Nx](https://img.shields.io/badge/Nx-000000?logo=nx&logoColor=white)

## ✨ Features

### For Travelers 🌍
- 🔍 Search hotels by city, dates, and price range
- 📱 Manage your reservations
- 💬 Direct messaging with hotel staff
- 📅 Real-time room availability
- ⭐ Hotel ratings and reviews

### For Hotel Managers 🏢
- 📊 Hotel and room management dashboard
- 🛏️ Room availability control
- 📨 Guest communication system
- 🏨 Multiple hotel management
- 💼 Reservation oversight

## 🚀 Tech Stack

### Frontend
- Next.js with React
- TypeScript
- Tailwind CSS
- Zustand for state management
- React Query
- Google Maps integration

### Backend
- NestJS
- TypeORM
- MySQL
- JWT Authentication
- TypeScript

______
> **DEMO**: [https://book-inn-bice.vercel.app](https://book-inn-bice.vercel.app)
______
### 👥 Available Users

You can use any of these users to test the application:

#### Agent user
- Email: agent@bookinn.com
- Password: password123
- Role: Agent

#### Traveler user
- Email: traveler@example.com
- Password: password123
- Role: Traveler

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9
- MySQL >= 8

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/book-inn.git
cd book-inn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
cp apps/web-react/.env.local.example apps/web-react/.env.local
```

4. Start the development servers:
```bash
# Start all services
npm run dev

# Start API only
npm run dev:api

# Start Web only
npm run dev:web
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:8080/api

## 🧪 Testing

```bash
# Run API tests
npm run test:api

# Run SDK tests
npm run test:api-sdk

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📱 Key Features in Detail

### Hotel Search and Booking
- Advanced search filters
- Availability checking
- Secure booking process
- Instant confirmation

### User Management
- JWT-based authentication
- Role-based access control
- User profiles
- Booking history

### Hotel Management
- Hotel information management
- Room inventory control
- Reservation management
- Guest communication

### UI/UX
- Responsive design
- Dark/Light mode support
- Interactive maps

## 🌐 Environment Variables

### API (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=root
DATABASE_NAME=book_inn
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_PLACES_API_KEY=your_google_api_key
```

### Frontend (apps/web-react/.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_api_key
```

## 📸 Screenshots

<div align="center">

###  Home Page & Search
<img src="apps/web-react/public/Screenshot6.png" alt="Messages" width="800"/>

### 📝 Hotels List
<img src="apps/web-react/public/Screenshot7.png" alt="Messages" width="800"/>

### 📝 Hotel Details
<img src="apps/web-react/public/Screenshot8.png" alt="Messages" width="800"/>

### 📝 Reservation Confirmation
<img src="apps/web-react/public/Screenshot1.png" alt="Home Page" width="800"/>

### 💬 Messages (light theme)
<img src="apps/web-react/public/Screenshot2.png" alt="Search Results" width="800"/>

### 📝 Edit/Create Hotel
<img src="apps/web-react/public/Screenshot5.png" alt="Agent Dashboard" width="800"/>

### 📝 Manage Reservations
<img src="apps/web-react/public/Screenshot3.png" alt="Hotel Detail" width="800"/>

### 📝 Manage Hotels
<img src="apps/web-react/public/Screenshot4.png" alt="Booking Process" width="800"/>


</div>

## 👻 LICENCE

[WTFPL](http://www.wtfpl.net/about/)
