import { Header } from '../components/layout/header';
import { Hero } from '../components/home/hero';
import { FeaturedHotels } from '../components/hotels/featured-hotels';
import { SearchParams } from '../components/search/search-bar';

const FEATURED_HOTELS = [
  {
    id: 'cartagena',
    href: '/hotels/cartagena',
    imageUrl: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1',
    imageAlt: 'Cartagena Colonial House',
    locations: ['Centro Histórico', 'Getsemaní', 'Bocagrande'],
    title: 'Colonial Luxury House',
    description: 'Historic charm meets modern luxury in the walled city',
    pricePerNight: 450,
    rating: 4.9,
    gridSpan: { cols: 2, rows: 2 }
  },
  {
    id: 'tayrona',
    href: '/hotels/tayrona',
    imageUrl: 'https://images.unsplash.com/photo-1597816751727-eae4097ce974',
    imageAlt: 'Tayrona Eco Lodge',
    locations: ['Parque Tayrona', 'Santa Marta'],
    title: 'Tayrona Eco Resort',
    description: 'Luxury eco-lodges in pristine Caribbean jungle',
    pricePerNight: 380,
    rating: 4.8,
    gridSpan: { cols: 1, rows: 1 }
  },
  {
    id: 'bogota',
    href: '/hotels/bogota',
    imageUrl: 'https://images.unsplash.com/photo-1628604426924-d1f24d333edc',
    imageAlt: 'Bogota Penthouse',
    locations: ['Chapinero', 'Usaquén', 'La Candelaria'],
    title: 'Luxury City Penthouse',
    description: 'Contemporary luxury in the heart of the capital',
    pricePerNight: 320,
    rating: 4.7,
    gridSpan: { cols: 1, rows: 1 }
  },
  {
    id: 'coffee-region',
    href: '/hotels/coffee-region',
    imageUrl: 'https://images.unsplash.com/photo-1599666433232-2b222eb02b8c',
    imageAlt: 'Coffee Region Hacienda',
    locations: ['Salento', 'Armenia', 'Manizales'],
    title: 'Coffee Hacienda Resort',
    description: 'Traditional coffee farm with luxury accommodations',
    pricePerNight: 280,
    rating: 4.9,
    gridSpan: { cols: 2, rows: 2 }
  },
];

export default function Home() {
  const handleSearch = async (searchParams: SearchParams) => {
    'use server';
    console.log('Search params:', searchParams);
  };

  return (
    <main className="min-h-screen bg-white">
      <Header isAuthenticated={true} userName="John Doe" isAgent/>
      <div className="pt-[56px]">
        <Hero
          onSearch={handleSearch}
          backgroundImage="/room-bg.jpg"
          title="Experience Luxury Beyond Imagination"
          subtitle="From boutique hotels to exclusive resorts, find your perfect escape in Colombia's most stunning locations"
        />
        <FeaturedHotels hotels={FEATURED_HOTELS} />
      </div>
    </main>
  );
}
