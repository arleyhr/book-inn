import { FeaturedHotel } from './featured-hotel';
import Link from 'next/link';

export interface FeaturedHotelsProps {
  hotels: Array<{
    id: string;
    href: string;
    imageUrl: string;
    imageAlt: string;
    locations: string[];
    title: string;
    description: string;
    pricePerNight: number;
    rating: number;
    gridSpan?: {
      cols: number;
      rows: number;
    };
  }>;
}

export function FeaturedHotels({ hotels }: FeaturedHotelsProps) {
  const enhancedHotels = hotels.map((hotel, index) => ({
    ...hotel,
    gridSpan: hotel.gridSpan || {
      cols: 1,
      rows: 1,
    },
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-gray-800">Trending Hotels</h2>
          <p className="text-gray-500 mt-2">Explore our hand-picked hotels</p>
        </div>
        <Link href="/hotels" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group">
          View all hotels
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 12L10 8L6 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {enhancedHotels.map((hotel) => (
          <FeaturedHotel
            key={hotel.id}
            {...hotel}
            className={`${hotel.gridSpan?.cols === 2 ? 'sm:col-span-2' : ''} ${hotel.gridSpan?.rows === 2 ? 'row-span-2' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
