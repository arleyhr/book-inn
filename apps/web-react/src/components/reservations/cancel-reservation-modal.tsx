import { useState } from 'react'
import { Card } from '../common/card'
import { Button } from '../common/button'

interface CancelReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  isLoading: boolean
}

export function CancelReservationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CancelReservationModalProps) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="min-h-full flex items-center justify-center p-4">
        <Card className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            Cancel Reservation
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cancellation Reason
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Please provide a reason for cancellation"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !reason.trim()}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
