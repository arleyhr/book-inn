export const getHotelImageUrl = (placeId: string | undefined | null, imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '/placeholder-hotel.jpg'
  if (placeId && process.env.NODE_ENV !== 'production') {
    return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`
  }

  return imageUrl
}

interface GridSpan {
  cols: number
  rows: number
}

export const getImageAspectRatio = (gridSpan: GridSpan): string => {
  const { cols, rows } = gridSpan

  if (cols === 2 && rows === 2) return 'aspect-[16/9]'
  if (cols === 1 && rows === 2) return 'aspect-[3/4]'

  return 'aspect-square'
}
