import { create } from 'zustand'

type ModalType = 'login' | 'register'

interface AuthModalState {
  isOpen: boolean
  modalType: ModalType
  openModal: (type: ModalType) => void
  closeModal: () => void
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  modalType: 'login',
  openModal: (type) => set({ isOpen: true, modalType: type }),
  closeModal: () => set({ isOpen: false }),
}))
