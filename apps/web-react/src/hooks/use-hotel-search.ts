import { useEffect } from 'react'
import { useSearchStore } from '../store/search'
import { useDebounce } from './use-debounce'

export const useHotelSearch = (defaultQuery?: string) => {
  const { searchInput, isLoading, hotels, setSearchInput, searchHotelsAction } = useSearchStore()
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    if (defaultQuery) {
      searchHotelsAction(defaultQuery)
    }
  }, [defaultQuery, searchHotelsAction])

  useEffect(() => {
    if (debouncedSearch) {
      searchHotelsAction(`name=${debouncedSearch}`)
    } else if (defaultQuery) {
      searchHotelsAction(defaultQuery)
    }
  }, [debouncedSearch, defaultQuery, searchHotelsAction])

  return {
    searchInput,
    isLoading,
    hotels,
    setSearchInput
  }
}
