import { Message } from '../../lib/api'

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  timestamp: string
}

export function MessageBubble({ message, isOwnMessage, timestamp }: MessageBubbleProps) {
  const senderName = isOwnMessage
    ? 'You'
    : message.sender?.role === 'agent'
      ? `${message.sender?.firstName} (Hotel Staff)`
      : `${message.sender?.firstName} ${message.sender?.lastName}`

  return (
    <div
      className={`flex items-start gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} px-2`}
    >
      {!isOwnMessage && (
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300
        `}>
          {(message.sender?.firstName?.[0] || '?').toUpperCase()}
        </div>
      )}
      <div className="flex flex-col max-w-[70%] gap-1">
        <span className={`
          text-xs ${isOwnMessage ? 'text-right' : 'text-left'}
          ${isOwnMessage ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}
        `}>
          {senderName}
        </span>
        <div
          className={`
            p-3.5 shadow-sm
            ${isOwnMessage
              ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-2xl rounded-tr-sm text-gray-800 dark:text-gray-100'
              : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl rounded-tl-sm text-gray-800 dark:text-gray-100'
            }
          `}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
          <span className={`
            text-[11px] mt-1.5 block text-right
            ${isOwnMessage ? 'text-blue-500/70 dark:text-blue-300/70' : 'text-gray-500/70 dark:text-gray-400/70'}
          `}>
            {timestamp}
          </span>
        </div>
      </div>
      {isOwnMessage && (
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300
        `}>
          {(message.sender?.firstName?.[0] || '?').toUpperCase()}
        </div>
      )}
    </div>
  )
}
