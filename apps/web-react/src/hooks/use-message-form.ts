import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMessagesStore } from '../store/messages'

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message is too long')
})

type MessageFormData = z.infer<typeof messageSchema>

export function useMessageForm(reservationId: string | null) {
  const { sendMessage, isSending } = useMessagesStore()

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: ''
    }
  })

  const onSubmit = async (data: MessageFormData) => {
    if (!reservationId) return

    try {
      await sendMessage(reservationId, data.message)
      form.reset()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSending
  }
}
