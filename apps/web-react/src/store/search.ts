import { create } from 'zustand'
import { searchHotels } from '../lib/api'
import type { Hotel } from '../lib/api'

interface SearchState {
  searchInput: string
  isLoading: boolean
  hotels: Hotel[]
  setSearchInput: (input: string) => void
  searchHotelsAction: (query?: string) => Promise<void>
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  searchInput: '',
  isLoading: false,
  hotels: [],
  setSearchInput: (input: string) => set({ searchInput: input }),
  searchHotelsAction: async (query) => {
    set({ isLoading: true })
    try {
      const hotels = await searchHotels(query || '')
      set({ hotels })
    } catch (error) {
      console.error('Error searching hotels:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  clearSearch: () => set({ searchInput: '', hotels: [] })
}))
