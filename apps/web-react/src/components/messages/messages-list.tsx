import { RefObject } from 'react'
import { format } from 'date-fns'
import { ScrollArea } from '../common/scroll-area'
import { Message } from '../../lib/api'
import { MessageBubble } from './message-bubble'

interface MessagesListProps {
  messages: Message[]
  currentUser: any
  messagesEndRef: RefObject<HTMLDivElement> | null
}

export function MessagesList({ messages, currentUser, messagesEndRef }: MessagesListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-6 pr-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUser?.id}
              timestamp={format(new Date(message.createdAt), 'p')}
            />
          ))
        )}
        <div ref={messagesEndRef} className="h-px" />
      </div>
    </ScrollArea>
  )
}
