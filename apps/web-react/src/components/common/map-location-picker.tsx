import { useEffect, useRef, useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries: ('places' | 'marker')[] = ['places', 'marker'];

interface MapLocationPickerProps {
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
  readonly?: boolean;
}

const defaultLocation = { lat: 4.710989, lng: -74.072092 }; // Bogotá, Colombia as default

const createPinElement = () => {
  const pin = document.createElement('div');
  pin.innerHTML = `
    <div class="relative">
      <div class="absolute -translate-x-1/2 -translate-y-full mb-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Drag to move
      </div>
      <div class="w-6 h-6 -translate-x-1/2 -translate-y-full group">
        <svg viewBox="0 0 24 24" class="w-full h-full text-red-500 drop-shadow-lg">
          <path fill="currentColor" d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 7.94 8.5 15.5 8.5 15.5s8.5-7.56 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      </div>
    </div>
  `;
  return pin;
};

export function MapLocationPicker({
  onLocationSelect,
  initialLocation,
  className,
  readonly,
}: MapLocationPickerProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<any>(null);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    version: 'beta',
  });

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    const location =
      initialLocation &&
      typeof initialLocation.lat === 'number' &&
      typeof initialLocation.lng === 'number' &&
      !isNaN(initialLocation.lat) &&
      !isNaN(initialLocation.lng)
        ? initialLocation
        : defaultLocation;

    try {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: location.lat, lng: location.lng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      };

      if (!mapRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, mapOptions);
        mapRef.current = map;
      } else {
        mapRef.current.setCenter({ lat: location.lat, lng: location.lng });
      }

      if (markerRef.current) {
        markerRef.current.position = { lat: location.lat, lng: location.lng };
      } else {
        try {
          const { AdvancedMarkerElement } = google.maps.marker;
          markerRef.current = new AdvancedMarkerElement({
            map: mapRef.current,
            position: { lat: location.lat, lng: location.lng },
            gmpDraggable: true,
            content: createPinElement(),
          });
        } catch (error) {
          markerRef.current = new google.maps.Marker({
            map: mapRef.current,
            position: { lat: location.lat, lng: location.lng },
            draggable: true,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
        }
      }

      if (searchInputRef.current) {
        const searchBoxInstance = new google.maps.places.SearchBox(
          searchInputRef.current,
        );
        setSearchBox(searchBoxInstance);

        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          if (places && places.length > 0) {
            const place = places[0];
            const location = place.geometry?.location;
            if (location) {
              const lat = location.lat();
              const lng = location.lng();
              if (
                typeof lat === 'number' &&
                typeof lng === 'number' &&
                !isNaN(lat) &&
                !isNaN(lng)
              ) {
                const newPosition = { lat, lng };
                mapRef.current?.setCenter(newPosition);
                markerRef.current.position = newPosition;
                updateLocation(newPosition, place.formatted_address || '');
              }
            }
          }
        });

        mapRef.current?.addListener('bounds_changed', () => {
          const bounds = mapRef.current?.getBounds();
          if (bounds) {
            searchBoxInstance.setBounds(bounds);
          }
        });
      }

      const dragEndHandler = () => {
        const position =
          markerRef.current.position instanceof google.maps.LatLng
            ? markerRef.current.position
            : new google.maps.LatLng(markerRef.current.position);

        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          if (
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            !isNaN(lat) &&
            !isNaN(lng)
          ) {
            const newPosition = { lat, lng };
            updateLocation(newPosition);
          }
        }
      };

      markerRef.current.addListener('dragend', dragEndHandler);

      mapRef.current?.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          if (
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            !isNaN(lat) &&
            !isNaN(lng)
          ) {
            const newPosition = { lat, lng };
            markerRef.current.position = newPosition;
            updateLocation(newPosition);
          }
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isLoaded, initialLocation]);

  const updateLocation = async (
    position: { lat: number; lng: number },
    providedAddress?: string,
  ) => {
    if (!onLocationSelect) return;

    let address = providedAddress;
    if (!address) {
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ location: position });
        if (result.results[0]) {
          address = result.results[0].formatted_address;
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }
    }

    onLocationSelect({
      lat: position.lat,
      lng: position.lng,
      address: address || '',
    });
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-red-500">Error loading Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className={className}>
      {!readonly ? (
        <div className="relative mb-4">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      ) : null}
      <div
        ref={mapContainerRef}
        className="w-full h-[400px] rounded-lg shadow-md dark:shadow-gray-800"
      />
    </div>
  );
}
