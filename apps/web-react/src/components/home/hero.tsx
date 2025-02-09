import Image from 'next/image';
import { SearchBar, SearchParams } from '../search/search-bar';

export interface HeroProps {
  onSearch: (params: SearchParams) => void;
  backgroundImage: string;
  title: string;
  subtitle: string;
}

export function Hero({ onSearch, backgroundImage, title, subtitle }: HeroProps) {
  return (
    <section className="relative min-h-[650px] md:h-[600px] flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover brightness-[0.6]"
          priority
        />
      </div>
      <div className="container mx-auto px-4 py-12 md:py-0 relative z-10 text-center text-white">
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-blue-400 to-sky-300 text-transparent bg-clip-text leading-normal py-2 [text-shadow:_0_2px_4px_rgba(0,0,0,0.1)]">
          {title}
        </h1>
        <p className="text-lg md:text-xl mb-8 md:mb-12 text-white max-w-2xl mx-auto">
          {subtitle}
        </p>
        <SearchBar onSearch={onSearch} />
      </div>
    </section>
  );
}
