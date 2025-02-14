import Link from 'next/link';
import { getHotelImageUrl, getImageAspectRatio } from '../../lib/images'

export interface FeaturedHotelProps {
  id: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  locations: string[];
  title: string;
  description: string;
  pricePerNight: number;
  rating: number;
  placeId?: string;
  gridSpan?: {
    cols: number;
    rows: number;
  };
  className?: string;
}

export function FeaturedHotel({
  href,
  imageUrl,
  imageAlt,
  locations,
  title,
  description,
  pricePerNight,
  rating,
  placeId,
  gridSpan = { cols: 1, rows: 1 },
  className = '',
}: FeaturedHotelProps) {
  const aspectRatio = getImageAspectRatio(gridSpan)

  return (
    <Link href={href} className={`group relative overflow-hidden rounded-2xl bg-gray-100 h-full ${className}`}>
      <div className="absolute inset-0">
        <img
          src={getHotelImageUrl(placeId, imageUrl)}
          alt={imageAlt}
          className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 to-gray-900/0" />
      <div className="absolute bottom-0 p-4 sm:p-6">
        <div className="flex items-center">
          {locations.map((location) => (
            <span key={location} className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20 mr-2">
              {location}
            </span>
          ))}
        </div>
        <h3 className="mt-2 text-xl font-semibold text-white">
          <span className="absolute inset-0" />
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-300">{description}</p>
        <div className="mt-2 flex items-center gap-4">
          <p className="text-lg font-semibold text-white">${pricePerNight} <span className="text-sm font-normal">per night</span></p>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium text-white">{rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
